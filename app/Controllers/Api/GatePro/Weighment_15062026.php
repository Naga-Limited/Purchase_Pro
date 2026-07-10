<?php

namespace App\Controllers\Api\GatePro;

use App\Helpers\SapUrlHelper;
use App\Controllers\Api\BaseApiController;
use App\Models\FCIModel;
use App\Models\GatePro\WeighmentService;
use App\Models\GatePro\GateService;
use App\Models\GatePro\MasterService;
use App\Models\LandingDataModel;
use App\Models\CourierModel;
use App\Helpers\VANumberHelper;



class Weighment extends BaseApiController
{
    // Get Weighment Images
    public function getWeighmentImages() {
        $postData = $this->request->getJSON(); 
        //print_r($postData);return;
        $weighmentService = new WeighmentService(); 
        $result = $weighmentService->getWeighmentImages($postData);
        
        $dataStatus = $result[0];
        $message = $result[1];
        $data = $result[2];

        if($dataStatus){
            return $this->respond(["success" => true, "message" => $message, "data" => array('cctvCameraImages'=>$data)]); 
        }     
        return $this->respond(["success" => false, "message"=> $message, "data" => []]);
    }

    // Inserting Weighment In Information
    public function addWeightSecond() {
        
        $postData = $this->request->getJSON();    
        $weighmentService = new WeighmentService();		
        $result = $weighmentService->addWeightSecond($postData);  
        
        $dataStatus = $result[0];
        $message = $result[1];
        $data = $result[2];

        if($dataStatus){
            return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
        }     
        return $this->respond(["success" => false, "message"=> $message, "data" => []]);   
    }

    // Get Weight Second
    public function getWeightSecond() {
        $model = new WeighmentService();
        $result = $model->getWeightSecond();
        // return  $this->sendSuccessResult($res);

        $dataStatus = count($result) > 0 ? true : false;
        $message = count($result) > 0 ? 'data found' : 'No data found';
        //  return $this->sendSuccessResult($result);
        return  $this->respond(["success" => $dataStatus, "message" => $message, "data" => $result]);     
    }

    // Add First Weight
    public function addFirstWeight() {
    
        $postData = $this->request->getJSON();    
        $weightmentService = new WeighmentService();
        $gateService = new GateService();
        $masterService = new MasterService();
        
        $first_weight = $postData->firstWeight;
        $pp_setting = $gateService->PP_Setting_Data();
        $empty_weight=$first_weight-$pp_setting[0]['vehicleMinWeight'];

        if($empty_weight <= 0){
            return $this->respond(["success" => false, "message"=> "Please Check Weight Details", "data" => []]); 
        }else if(($postData->netWeight < 0 && isset($postData->secondWeight) && $postData->gate_Status == false) || ($postData->secondWeight == 'KG' || $first_weight == 'KG')){
            return $this->respond(["success" => false, "message"=> "Please Check Weight Details", "data" => []]); 
        }
        
        $getData = $gateService->getGateInInfo(0, 0, 0, $postData->gateInOutInfoId, $postData->userInfoId); 

	$plantCheck = $weightmentService->PlantValidation($postData->gateInOutInfoId, $postData->userInfoId);

        $db = db_connect();
        $builder = $db->table('purchase_order');

        $existing = $builder->where([
              'loadingUnloadingInfoId'   => $getData[0]['loadingUnloadingInfoId'],
          ])->get()->getRowArray();
        if($plantCheck[0]['count'] == 0){
            return $this->respond(["success" => false, "message"=> "Please Check User Plant Access", "data" => []]); 
        }else if(($getData[0]['moduleTypeId'] == 12 || $getData[0]['moduleTypeId'] == 15 || $getData[0]['moduleTypeId'] == 21 || $getData[0]['moduleTypeId'] == 33 || $getData[0]['moduleTypeId'] == 34) && ($getData[0]['loadingUnloadingInfoId'] == '' || $getData[0]['loadingUnloadingInfoId'] == null)){
            return $this->respond(["success" => false, "message"=> "Please Check PO Number", "data" => []]);
        }else if(($getData[0]['moduleTypeId'] == 12 || $getData[0]['moduleTypeId'] == 15 || $getData[0]['moduleTypeId'] == 21 || $getData[0]['moduleTypeId'] == 33 || $getData[0]['moduleTypeId'] == 34) && !isset($existing)){
            return $this->respond(["success" => false, "message"=> "Please Check PO Number", "data" => []]);
        }
        
        $getLoadingUnloadingData = $masterService->getLoadingAndUnloadingInfo(0, $getData[0]['loadingUnloadingInfoId'], $postData->userInfoId);
        $loadingUnloadingModuleTypeId = $getLoadingUnloadingData[0]['moduleTypeId'];     
	
        if($getData[0]['moduleTypeId'] == 3 || $getData[0]['moduleTypeId'] == 9){            
            if($getData[0]['weighmentInfoId'] != ""){
                $urlPath ="ZGP_FG_RET/FG_Return?sap-client=900";

                $sap_data = array (        
                    "VA_NUMBER" => $getData[0]['vaNumber'],    
                    "SCREEN_TYPE" => $getData[0]['moduleTypeId'] == 3 ? "FG-RETURN" : $getData[0]['moduleType'],
                    "RETURN_REFERENCE" => $getData[0]['returnRefNo'],
                    "SALES_INVOICE" => $getData[0]['salesInvoiceNo'],
                    "CUSTOMER_NAME" => $getData[0]['customerName'],
                    "TRUCK_NUMBER" => $getData[0]['vehicleNo'],
                    "PLANT" => $getData[0]['werks'],
                    "DRIVER_PH" => $getData[0]['driverMobileNumber'],
                    "WAIT_OUTSIDE" => $getData[0]['waitingStatus'],
                    "GATE_IN" => $getData[0]['gateInDateStamp'],
                    "REMARKS" => $postData->remarks,
                    "first_weight" => $postData->firstWeight,
                    "Second_weight" => $postData->secondWeight,
                    "net_weight" => $postData->netWeight,
                    "GATE_OUT" => ""
                );
                $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));             
                
                $message = $res[0]->MESSAGE;
                
                if(($res[0]->STATUS) > 0){
                    $result = $weightmentService->addFirstWeight($postData,$getData[0]['moduleTypeId']);
                
                    $dataStatus = $result[0];
                    $message = $result[1];
                    $data = $result[2];
                
                    if($dataStatus){  
                        
                        $postData->weighmentInfoId = $data ? $data : $postData->weighmentInfoId;
                        $result = $weightmentService->addImageUrl($postData);
    
                        return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
                    }     
                    return $this->respond(["success" => false, "message"=> $message, "data" => []]);  
                }
                return $this->respond(["success" => false, "message"=> "$message Please Contact SAP Team", "data" => []]); 
            }
            else{
                $result = $weightmentService->addFirstWeight($postData,$getData[0]['moduleTypeId']);
                
                $dataStatus = $result[0];
                $message = $result[1];
                $data = $result[2];
            
                if($dataStatus){  
                    
                    $postData->weighmentInfoId = $data ? $data : $postData->weighmentInfoId;
                    $result = $weightmentService->addImageUrl($postData);

                    return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
                }     
                return $this->respond(["success" => false, "message"=> $message, "data" => []]);  
            }            
        }
        else if($getData[0]['moduleTypeId'] == 8){            
            if($getData[0]['weighmentInfoId'] != ""){
                $urlPath ="zgatepro/zgp_rm_wei_det/Gatepro?sap-client=900";

                $sap_data = array (
                    "va_number" => $getData[0]['vaNumber'],    
                    "screen_type" => "RM - Sales",
                    "truck_number" => $getData[0]['vehicleNo'],
                    "plant" => $getData[0]['werks'],
                    "driver_phone" => $getData[0]['driverMobileNumber'],
                    "gate_in" => $getData[0]['gateInDateStamp'],
                    "gate_out" => "",
                    "first_weight" => $postData->firstWeight,
                    "Second_weight" => $postData->secondWeight,
                    "net_weight" => $postData->netWeight,
                );

                $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));             
                
                $message = $res[0]->MESSAGE;
                
                if(($res[0]->STATUS) > 0){
                    $result = $weightmentService->addFirstWeight($postData,$getData[0]['moduleTypeId']);
                
                    $dataStatus = $result[0];
                    $message = $result[1];
                    $data = $result[2];
                
                    if($dataStatus){  
                        
                        $postData->weighmentInfoId = $data ? $data : $postData->weighmentInfoId;
                        $result = $weightmentService->addImageUrl($postData);
    
                        return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
                    }     
                    return $this->respond(["success" => false, "message"=> $message, "data" => []]);  
                }
                return $this->respond(["success" => false, "message"=> "$message Please Contact SAP Team", "data" => []]); 
            }
            else{
                $result = $weightmentService->addFirstWeight($postData,$getData[0]['moduleTypeId']);
                
                $dataStatus = $result[0];
                $message = $result[1];
                $data = $result[2];
            
                if($dataStatus){  
                    
                    $postData->weighmentInfoId = $data ? $data : $postData->weighmentInfoId;
                    $result = $weightmentService->addImageUrl($postData);

                    return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
                }     
                return $this->respond(["success" => false, "message"=> $message, "data" => []]);  
            }            
        }else if(($getData[0]['movementTypeId'] == 1 && ($getData[0]['moduleTypeId'] == 1 || $getData[0]['moduleTypeId'] == 2 || $getData[0]['moduleTypeId'] == 43 )) ||        
        ($postData->weighmentInfoId > 0 && $getData[0]['moduleTypeId'] == 29 && $postData->documentNumber != 'D2R SALES' && $postData->documentNumber != 'GT SALES' && $postData->documentNumber != 'EXPORT SALES') || ($getData[0]['movementTypeId'] == 2 && ($getData[0]['moduleTypeId'] == 1 || $getData[0]['moduleTypeId'] == 2 && ($getData[0]['isRedirect'] == 1)))){

            $urlPath ="zgatepro/zfgsales_weight/GP_SAP_FG?sap-client=900";
            $moduleType = '';
            $shipmentOrderNo = '';
	    if($postData->moduleType == 'FG-STO'){
	    	$moduleType = 'FG-STO';
	    }else if($getData[0]['subModuleTypeId'] == 20 || $getData[0]['subModuleTypeId'] == 21 || $getData[0]['subModuleTypeId'] == 19 || $getData[0]['moduleTypeId'] == 29){
                $moduleType = 'Other-Sales';
            } else if($getData[0]['moduleTypeId'] == 1 || $getData[0]['moduleTypeId'] == 43){
                $moduleType = 'FG-Sales';
            } else{
                $moduleType = 'FG-STO';
            }   
            
            if($getData[0]['subModuleTypeId'] == 19){
              $tripsheetNumber = 'No Tripsheet';
            }else if(isset($getData[0]['tripSheetNumber'])){
                $tripsheetNumber = $getData[0]['tripSheetNumber'];
            }
            else if($getData[0]['subModuleTypeId'] == 20 || ($getData[0]['subModuleTypeId'] == 21 ) || ($getData[0]['subModuleTypeId'] == 19 && $postData->tripsheetNumber == '') || $getData[0]['moduleTypeId'] == 43){
                $tripsheetNumber = 'No Tripsheet';
            }else if($postData->tripsheetNumber != ''){
                $tripsheetNumber = $postData->tripsheetNumber;
            }else{
                $tripsheetNumber = $getData[0]['tripSheetNumber'];
            }
          
            if($postData->moduleType == 'FG-STO'){
              $shipmentOrderNo = '';
            }else{
              $shipmentOrderNo = $postData->shipmentOrderNo != '' ? $postData->shipmentOrderNo : $getData[0]['shipmentOrderNo'];
            }
            //print_r($loadingUnloadingModuleTypeId);exit;
            if($getData[0]['moduleTypeId'] == 29){
              $METHOD = 'POST';
            }else if($getData[0]['secondWeight'] != null) {
              $METHOD = 'PUT';
            }else if($postData->secondWeight > 0) {
              $METHOD = 'PUT';
            }else {
              $METHOD = 'POST';
            }
            if($getData[0]['moduleStatusId'] == 3 && $getData[0]['moduleTypeId'] == 43){
                $first_weight = $getData[0]['firstWeight'];
                $netweight = $postData->secondWeight-$getData[0]['firstWeight'];
            }else{
                $first_weight = $postData->firstWeight;
                $netweight = $postData->netWeight;
            }
            $netWeight1 = null;
            $diffWeight = null;
            if($getData[0]['bulkerEmptyWeight']){
                $netWeight1 = $postData->secondWeight - $getData[0]['bulkerEmptyWeight'];
                $diffWeight = $netWeight1 - $postData->netWeight;
            }
            $sap_data = array (
                "ZZTRANSATION_TYPE" => $moduleType,
                "ZZTRUCK_NO" => $getData[0]['vehicleNo'],
                "ZZVA_NO" => $getData[0]['vaNumber'],
                "ZZDRIVER_PH" => $getData[0]['driverMobileNumber'],
                "ZZROUTE" => $getData[0]['route'],
                "ZZPLANT" => $getData[0]['werks'],
                "ZZCOLOR" => $getData[0]['colorToken'] ? $getData[0]['colorToken'] : "Not Applicable",
                "ZZREASON" => $getData[0]['rejectReason'],
                "ZZREMARKS" => $getData[0]['remarks'],
                "ZZTRIPSHEET_NO" => $tripsheetNumber,
                "ZZFirstWeight" => $first_weight,
                "ZZSecondWeight" => $postData->secondWeight,
                "ZZNetweight" => $netweight,
                "ZZSHIPMENT_NO" => $shipmentOrderNo,
                "ZZGATEIN_TIME" => $getData[0]['gateInDateStamp'],
                "ZZPO_NO" => "",
                "ZZDELIVERY_NO1" => "",
                "ZZDELIVERY_NO2" => "",
                "ZZREC_PLANT" => "",
                "ZZREC_STORAGE_LOC" => "",
                 // ✅ Correct fallback logic
                "NETWEIGHT"  => $netWeight1 !== null ? $netWeight1 : $netweight,
                "DIFFWEIGHT" => $diffWeight !== null ? $diffWeight : 0,
                "veh_type" => $getData[0]['vehicleType'],
                "METHOD" => $METHOD,
                "ZZLINE" => ($getData[0]['secondWeight'] == null || ($getData[0]['moduleStatusId'] == 3 && $getData[0]['moduleTypeId'] == 43)) ? 1 : 2
            );

            //print_r($sap_data);exit;
            $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
            $message = $res[0]->MESSAGE;
            
            if(($res[0]->STATUS) > 0){
                $result = $weightmentService->addFirstWeight($postData,$getData[0]['moduleTypeId']);
            
                $dataStatus = $result[0];
                $message = $result[1];
                $data = $result[2];
            
                if($dataStatus){  
                    
                    $postData->weighmentInfoId = $data ? $data : $postData->weighmentInfoId;
                    $result = $weightmentService->addImageUrl($postData);

                    return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
                }   
                return $this->respond(["success" => false, "message"=> $message, "data" => []]);    
            }
            else{
                return $this->respond(["success" => false, "message"=> "$message Please Contact SAP Team", "data" => []]);   
            }                     
        }
        else{
                    // print_r($getData);exit;
            $result = $weightmentService->addFirstWeight($postData,$getData[0]['moduleTypeId']);
            
            $dataStatus = $result[0];
            $message = $result[1];
            $data = $result[2];
        
            if($dataStatus){  
                
                $postData->weighmentInfoId = $data ? $data : $postData->weighmentInfoId;
                $result = $weightmentService->addImageUrl($postData);

                return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
            }     
            return $this->respond(["success" => false, "message"=> $message, "data" => []]);  
        } 
        
    }
    
    // Get Weightment Info
     public function getWeighmentInfo($vehicleNo, $gateInOutInfoId, $userInfoId, $documentNumber=null) {
        $model = new WeighmentService();
        $result = $model->getWeighmentInfo($vehicleNo, $gateInOutInfoId, $userInfoId, $documentNumber);
        $dataStatus = $result[0];
        $message = $result[1];
        $data = $result[2];     
        $netWeight = $result[3];     
        $GateId = $result[4];     
        if($GateId[0]['masterGateId'] == 17 || $GateId[0]['masterGateId'] == 19 || $userInfoId == 1){
            $gate_Status = true ;
        }else {
            $gate_Status = false ;
        }
        if($dataStatus){
            return $this->respond(["success" => true, "message" => $message, "data" => $data,"netWeightValidation"=>-$netWeight[0]['net_weight_validation'] ,'gate_Status'=>$gate_Status]); 
        }     
        return $this->respond(["success" => false, "message"=> $message, "data" => []]);  
    }

    // Get Weighment Document Details
    public function getWeighmentDocumentDetails($gateInOutInfoId) {
        $weighmentService = new WeighmentService();
        $result = $weighmentService->getWeighmentDocumentDetails($gateInOutInfoId);
        
        $dataStatus = count($result) > 0 ? true : false;
        $message = count($result) > 0 ? 'data found' : 'No data found';

        return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
    }
 
      // Reject Weighment Info
    public function rejectWeighmentInfo() {
    
        $postData = $this->request->getJSON();    
        $weighmentService = new WeighmentService();		
        $result = $weighmentService->rejectWeighmentInfo($postData);  
        
        $dataStatus = $result[0];
        $message = $result[1];
        $data = $result[2];

        if($dataStatus){

        return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
        }     
        return $this->respond(["success" => false, "message"=> $message, "data" => []]);   
    }

    // Add Test Weighbridge
    public function addTestWeighbridge() {
        
        $postData = $this->request->getJSON();    
        $weighmentService = new WeighmentService();		
        $result = $weighmentService->addTestWeighbridge($postData);  
        
        $dataStatus = $result[0];
        $message = $result[1];
        $data = $result[2];

        if($dataStatus){
            return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
        }     
        return $this->respond(["success" => false, "message"=> $message, "data" => []]);   
    }

    // Get Test Weighbridge
      public function getTestWeighbridge($vehicleNo, $userInfoId, $testWeighbridgeId=null) {
        $weighmentService = new WeighmentService();
        $result = $weighmentService->getTestWeighbridge($vehicleNo, $userInfoId, $testWeighbridgeId);
        
        $dataStatus = count($result) > 0 ? true : false;
        $message = count($result) > 0 ? 'data found' : 'No data found';

        return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
    }

    // Update Test Weighbridge
    public function updateTestWeighbridge(){

        $postData = $this->request->getJSON();
        $weighmentService = new WeighmentService();   
        $result = $weighmentService->updateTestWeighbridge($postData);

        $dataStatus = $result[0];
        $message = $result[1];

        if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]);
        }     
        return $this->respond(["success" => false, "message"=> $message]);
    }

    // Approve Vehicle Status
    public function approveVehicleStatus(){

        $postData = $this->request->getJSON();
        $weighmentService = new WeighmentService();   
        $result = $weighmentService->approveVehicleStatus($postData);
    
        $dataStatus = $result[0];
        $message = $result[1];
    
        if($dataStatus){
          return $this->respond(["success" => true, "message" => $message]);
        }     
        return $this->respond(["success" => false, "message"=> $message]);
    }

    // Approve Vehicle Status
    public function addTestWeighmentInfo(){

        $postData = $this->request->getJSON();
        $weighmentService = new WeighmentService();   
        $result = $weighmentService->addTestWeighmentInfo($postData);
    
        $dataStatus = $result[0];
        $message = $result[1];
    
        if($dataStatus){
          return $this->respond(["success" => true, "message" => $message]);
        }     
        return $this->respond(["success" => false, "message"=> $message]);
    }

    // Get Test Weighment Info
    public function getTestWeighmentInfo($vehicleNo, $testWeighbridgeId, $userInfoId) {
        $weighmentService = new WeighmentService();
        $result = $weighmentService->getTestWeighmentInfo($vehicleNo, $testWeighbridgeId, $userInfoId);
        
        $dataStatus = count($result) > 0 ? true : false;
        $message = count($result) > 0 ? 'data found' : 'No data found';

        return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
    }



    // Get Weightment Info
    public function getDocumentDetails($gateInOutInfoId, $userInfoId) {       

        $documentDetailsData = $documentData = $gatePassDocumentData = $SSAndPMDocumentData = $purchaseOrderDetails = $tripSheetDocumentData = $FGSales= []; 
               
        $gateService = new GateService();
        $model = new MasterService();
        $Landing_Data = new LandingDataModel();

        $result = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, $userInfoId);
        $invoiceInfo = $gateService->getGateInOutInfoDetails($gateInOutInfoId);
        $loadingUnloadingInfoId = $result[0]['loadingUnloadingInfoId'];
        $vaNumber = $result[0]['vaNumber'];
        $tripSheetNumber = $result[0]['tripSheetNumber'];
        $moduleTypeId = $result[0]['moduleTypeId'];
        $vehicleNo = $result[0]['vehicleNo'];
        $isIFoodSales = $result[0]['getIsIFoodSales'];
        $secondWeight = $result[0]['secondWeight'];

        $purchaseOrderDetails = $model->getPurchaseOrder($loadingUnloadingInfoId);
        $fgUrl = "zgatepro/zfg_shipment/zsap_gp_shipment?sap-client=900&Tripsheet_no=$tripSheetNumber&Va_no=$vaNumber";
        $fgDetails = SapUrlHelper::getWhDatas($fgUrl);
        $fgDetailsData = json_decode($fgDetails);

	if(($moduleTypeId == 2 && $result[0]['movementTypeId'] == 1) || $moduleTypeId == 1){
            foreach($fgDetailsData as $fg_details_data){
                if(count($fgDetailsData) > 0 && $fg_details_data->FROM_PLANT) {
                    if($fg_details_data->TYPE == 'FG-Sales'){
                        $sapDocument = 'shipmentOrderNo';
                    }else {
                        $sapDocument = 'stoPoNo';
                    }
                    $plant_id=$Landing_Data->PlantByID($fg_details_data->FROM_PLANT);
                        $data = array(
                            "moduleType" => $fg_details_data->TYPE == 'FG-Sales'? 1 : 2,
                            "masterPlantId" => $plant_id[0]['ID'],
                            $sapDocument => $fg_details_data->SAP_DOCUMENT
                        );
                    $Landing_Data->Gate_info_Status_Change($gateInOutInfoId, $data);			
                }
            }
        }
        
        if($result[0]['movementTypeId'] == 2 && $result[0]['moduleTypeId'] == 2){
            foreach ($invoiceInfo as $documentDetails) {
                $documentData[] = array(
                    "value" => $documentDetails['poNumber'],
                    "label" => $documentDetails['poNumber'],          
                    "moduleType" => $documentDetails['moduleType'],          
                );                 
            }            
        }else{
            if($result[0]['subModuleTypeId'] == 19 ||$result[0]['subModuleTypeId'] == 20 || $result[0]['subModuleTypeId'] == 21){
                $FGSales[] = array(
                    "value" => 'FG-Sales',
                    "label" => 'FG-Sales',
                );  
            }
            foreach ($fgDetailsData as $documentDetails) {
                $documentData[] = array(
                    "value" => $documentDetails->SAP_DOCUMENT,
                    "label" => $documentDetails->SAP_DOCUMENT,          
                    "moduleType" => $documentDetails->TYPE,
                    "documentWeight" => $documentDetails->OVERALL_DELIVERY_WT
                );                 
            }
        }

        // print_r($documentData);return;

        $gatePassUrl = "zgatepro/zsap_pp_gatepas/gatepass?sap-client=900&va_no=$vaNumber";
        $gatePassDetails = SapUrlHelper::getWhDatas($gatePassUrl);
        $gatePassDetailsData = json_decode($gatePassDetails);

        foreach ($gatePassDetailsData as $documentDetails) {
            $gatePassDocumentData[] = array(
                "value" => $documentDetails->GATEPASS_NO,
                "label" => $documentDetails->GATEPASS_NO,    
                "moduleType" => $documentDetails->TYPE          
            ); 
        }

        $SSAndPmUrl = "zgatepro/zss_pm_del/Gatepro?sap-client=900&&VA_NO=$vaNumber";
        $SSAndPmDetails = SapUrlHelper::getWhDatas($SSAndPmUrl);
        $SSAndPmDetailsData = json_decode($SSAndPmDetails);

        foreach ($SSAndPmDetailsData as $documentDetails) {
            $SSAndPMDocumentData[] = array(
                "value" => $documentDetails->PO_NUMBER,
                "label" => $documentDetails->PO_NUMBER,
                "moduleType" => $documentDetails->TYPE       
            ); 
        }

        $tripSheetUrl = "zgatepro/zfg_tripsheet/FG?sap-client=900&Vehicle_No=$vehicleNo";
        $tripSheetDetails = SapUrlHelper::getWhDatas($tripSheetUrl);
        $tripSheetDetailsData = json_decode($tripSheetDetails);       

        $shipmentData = $tripSheetDetailsData[0]->SAP_LINE[0];
        if($moduleTypeId == 29){
            $D2RSalesData[] = array(
                "value" => 'D2R Sales',
                "label" => 'D2R Sales',
            );
            $DTSalesData[] = array(
                "value" => 'GT Sales',
                "label" => 'GT Sales',
            );
            $ExportSalesData[] = array(
                "value" => 'Export Sales',
                "label" => 'Export Sales',
            );
        }
        if($shipmentData != ''){
            $tripSheetDocumentData[] = array(
                "value" => $shipmentData->SHIPMENTORDERNO,
                "label" => $shipmentData->SHIPMENTORDERNO,
                "moduleType" => 'FG-Sales'       
            ); 
        }
        

        if($moduleTypeId == 29){
            $documentDetailsData = array_merge($D2RSalesData, $DTSalesData,$ExportSalesData);
        } 
        else if($moduleTypeId == 29 && $tripSheetDocumentData != []){
            $documentDetailsData = $tripSheetDocumentData;
        }
        else {
            $documentDetailsData = array_merge($FGSales, $documentData, $gatePassDocumentData, $SSAndPMDocumentData, $purchaseOrderDetails);
        }    
        $dataStatus = count($documentDetailsData) > 0 ? true : false;
        $message = count($documentDetailsData) > 0 ? 'data found' : 'No data found';
        return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $documentDetailsData]);
    }

    public function getShipmentNo($vehicleNo, $shipmentNo, $gateInOutInfoId, $userInfoId,$sap) {
        $Landing_Data = new LandingDataModel();
        $Url = "zgatepro/zfg_shipment/zsap_gp_shipment_md?sap-client=900&Shipment_no=$shipmentNo&Truck=$vehicleNo";
        
        $result = SapUrlHelper::getWhDatas($Url);
        $result = json_decode($result);
    
        // Ensure $result is valid and is an array
        if (!is_array($result) || empty($result)) {
            return $this->respond([
                "success" => false,
                "message" => "please enter correct shipment no",
                "results" => []
            ]);
        }
    
        $fromPlant = $result[0]->FROM_PLANT ?? null;
        
        // Check user's plant access
        $plant_access_check = $Landing_Data->UserPlantCheck($fromPlant, $userInfoId);
        if ($plant_access_check == 0) {
            return $this->respond([
                "success" => false,
                "message" => "Plant not maintained for this user - " . $fromPlant,
                "results" => []
            ]);
        }
        if($sap == 1){
            $gateService = new GateService();
            $getData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, $userInfoId); 
            $urlPath1 ="zgatepro/zfgsales_weight/GP_SAP_FG?sap-client=900";
            $sap_data = array (
                "ZZTRANSATION_TYPE" => 'FG-Sales',
                "ZZTRUCK_NO" => $getData[0]['vehicleNo'],
                "ZZVA_NO" => $getData[0]['vaNumber'],
                "ZZDRIVER_PH" => $getData[0]['driverMobileNumber'],
                "ZZROUTE" => $getData[0]['route'],
                "ZZPLANT" => $getData[0]['werks'],
                "ZZCOLOR" => $getData[0]['colorToken'] ? $getData[0]['colorToken'] : "Not Applicable",
                "ZZREASON" => $getData[0]['rejectReason'],
                "ZZREMARKS" => $getData[0]['remarks'],
                "ZZTRIPSHEET_NO" => $getData[0]['tripSheetNumber'] ?? 'No Tripsheet',
                "ZZFirstWeight" => $getData[0]['firstWeight'],
                "ZZSecondWeight" => $getData[0]['secondWeight'],
                "ZZNetweight" => $getData[0]['netWeight'],
                "ZZSHIPMENT_NO" => $result[0]->SAP_DOCUMENT,
                "ZZGATEIN_TIME" => $getData[0]['gateInDateStamp'],
                "ZZPO_NO" => "",
                "ZZDELIVERY_NO1" => "",
                "ZZDELIVERY_NO2" => "",
                "ZZREC_PLANT" => "",
                "ZZREC_STORAGE_LOC" => "",
                 // ✅ Correct fallback logic
                "NETWEIGHT"  => $getData[0]['netWeight'],
                "DIFFWEIGHT" => 0,
                "veh_type" => $getData[0]['vehicleType'],
                "METHOD" => 'PUT',
                "ZZLINE" =>  1
            );
            // print_r($sap_data);exit;

            $res = SapUrlHelper::PushToSap($urlPath1,json_encode([$sap_data]));
            // print_r($res);exit;
            $message = $res[0]->MESSAGE;
            // If SAP validation is required
            if ($res[0]->STATUS > 0) {
                 $data = ['shipmentOrderNo' => $result[0]->SAP_DOCUMENT,
                 'overAllDeliveryQuantity' => $result[0]->OVERALL_DELIVERY_WT,
                ];
                 $Landing_Data->Gate_info_Status_Change($gateInOutInfoId, $data);
                return $this->respond([
                    "success" => true,
                    "message" => "Data found",
                    "results" => $result
                ]);
            }else{
                return $this->respond([
                    "success" => false,
                    "message" => "$message Please Contact SAP Team",
                    "results" => []
                ]);
            }
        }else{
            $gateService = new GateService();
            $getData = $gateService->getGateInInfo(0, 0, 0, $gateInOutInfoId, $userInfoId); 
            $urlPath1 ="zgatepro/zfgsales_weight/GP_SAP_FG?sap-client=900";
            $sap_data = array (
                "ZZTRANSATION_TYPE" => 'FG-Sales',
                "ZZTRUCK_NO" => $getData[0]['vehicleNo'],
                "ZZVA_NO" => $getData[0]['vaNumber'],
                "ZZDRIVER_PH" => $getData[0]['driverMobileNumber'],
                "ZZROUTE" => $getData[0]['route'],
                "ZZPLANT" => $getData[0]['werks'],
                "ZZCOLOR" => $getData[0]['colorToken'] ? $getData[0]['colorToken'] : "Not Applicable",
                "ZZREASON" => $getData[0]['rejectReason'],
                "ZZREMARKS" => $getData[0]['remarks'],
                "ZZTRIPSHEET_NO" => $getData[0]['tripSheetNumber'] ?? 'No Tripsheet',
                "ZZFirstWeight" => $getData[0]['firstWeight'],
                "ZZSecondWeight" => $getData[0]['secondWeight'],
                "ZZNetweight" => $getData[0]['netWeight'],
                "ZZSHIPMENT_NO" => $result[0]->SAP_DOCUMENT,
                "ZZGATEIN_TIME" => $getData[0]['gateInDateStamp'],
                "ZZPO_NO" => "",
                "ZZDELIVERY_NO1" => "",
                "ZZDELIVERY_NO2" => "",
                "ZZREC_PLANT" => "",
                "ZZREC_STORAGE_LOC" => "",
                 // ✅ Correct fallback logic
                "NETWEIGHT"  => $getData[0]['netWeight'],
                "DIFFWEIGHT" => 0,
                "veh_type" => $getData[0]['vehicleType'],
                "METHOD" => 'POST',
                "ZZLINE" =>  1
            );
            // print_r($sap_data);exit;

            $res = SapUrlHelper::PushToSap($urlPath1,json_encode([$sap_data]));
            // print_r($res);exit;
            $message = $res[0]->MESSAGE;
            // If SAP validation is required
            if ($res[0]->STATUS > 0) {
                 $data = ['shipmentOrderNo' => $result[0]->SAP_DOCUMENT,
                 'overAllDeliveryQuantity' => $result[0]->OVERALL_DELIVERY_WT,
                ];
                 $Landing_Data->Gate_info_Status_Change($gateInOutInfoId, $data);
                return $this->respond([
                    "success" => true,
                    "message" => "Data found",
                    "results" => $result
                ]);
            }else{
                return $this->respond([
                    "success" => false,
                    "message" => "$message Please Contact SAP Team",
                    "results" => []
                ]);
            }
        }
    }

}
