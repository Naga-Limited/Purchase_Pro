<?php

namespace App\Controllers\Api\GatePro;

use App\Helpers\SapUrlHelper;
use App\Controllers\Api\BaseApiController;
use App\Models\GatePro\GateService;
use App\Models\GatePro\MasterService;
use App\Models\LandingDataModel;

class Gate extends BaseApiController
{
  
  // Inserting Gate In Information
  public function addGateInInfo() {
    // print_r($_POST);exit;
    $postData = $this->request->getJSON();
    // print_r($postData);exit;
    $gateService = new GateService();		
    $landingDataModel = new LandingDataModel();
    $masterService = new MasterService();	
    if(isset($postData->userInfoId)){
       $result1 = $gateService->isVehicleAlreadyIn($postData->userInfoId);
       if($result1 > 0){
       return $this->respond(["success" => false, "message"=> 'Clear Old Entries', "data" => []]);
       }
    }
    // 2️⃣ Check vehicle already in using EMPTY + PURCHASE union
    if (strlen($postData->vehicleNo) > 0) {

        $already_in_Check = $masterService->VehicleAlreadyInCheckPurchase($postData->vehicleNo);
        // ---- SAFE CHECK ----
        if (!empty($already_in_Check)) {
            $record = $already_in_Check[0];

            $werks = isset($record['WERKS']) ? trim($record['WERKS']) : "";
            $plant = isset($record['PLANT_NAME']) ? trim($record['PLANT_NAME']) : "";

            if ($werks !== "") {
                $message = "Vehicle Already In - " . $plant . " ( " . $werks . " )";
                return $this->respond([
                    "success" => false,
                    "message" => $message,
                    "data" => []
                ]);
            }
        }
    }
    $result = $gateService->addGateInInfo($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];
    $vehicle = $result[3] == '' ? 'BYHAND' : $result[3];
    if($dataStatus){

      if($postData->subModuleTypeId == 1 || $postData->subModuleTypeId == 3){
        $result = $landingDataModel->gatepass_delivery_info($data, $postData->gatePassDetails);
      }

      return $this->respond(["success" => true, "message" => $message, "data" => $data , 'vehicle' => $vehicle]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "data" => []]);   
  }

  //Get Gate In Info
  public function getGateInInfo($vehicleNo, $moduleStatusId = null, $moduleTypeId = null, $gateInOutInfoId = null, $userInfoId = null) {
    $weighmentImages = array();
    $gateService = new GateService();    
    $masterService = new MasterService();    
    $result = $gateService->getGateInInfo($vehicleNo, $moduleStatusId, $moduleTypeId, $gateInOutInfoId, $userInfoId);
    $Landing_Data = new LandingDataModel();
	if($result[0]['moduleStatusId'] == 1 && $result[0]['movementTypeId'] == 1 && ($result[0]['moduleTypeId'] == 2 || $result[0]['moduleTypeId'] == 1)){
        $fgUrl = "zgatepro/zfg_tripsheet/FG?sap-client=900&Vehicle_No=$vehicleNo";
        $fgDetails = SapUrlHelper::getWhDatas($fgUrl);
        $fgDetailsData = json_decode($fgDetails);
            if($fgDetailsData[0]->SAP_LINE[0]->SHIPMENTORDERNO && ($result[0]['moduleTypeId'] == 2 || $result[0]['moduleTypeId'] == 1)) {
                  $sapDocument = 'shipmentOrderNo';
                  $data = array(
                      $sapDocument => $fgDetailsData[0]->SAP_LINE[0]->SHIPMENTORDERNO,
                      'tripSheetNumber' => $fgDetailsData[0]->TRIPSHEET_NO,
                      'moduleType'=> 1
                  );
                $Landing_Data->Gate_info_Status_Change($result[0]['gateInOutInfoId'], $data);			
            
            }
        }

    $weighmentInfoId = $result[0]['weighmentInfoId'];
    $gateInOutInfoId = $result[0]['gateInOutInfoId'];
    $waitingAt= $result[0]['waitingAt'];
    $weighmentImages = $gateService->getWeighmentImages($weighmentInfoId);
    $invoiceInfo = $gateService->getGateInOutInfoDetails($gateInOutInfoId);
    $sapDeliveryData = $gateService->getSapDeliveryDetails($gateInOutInfoId);
    $salesReturnInfo = $masterService->getFgSalesReturnQuantityDetails($result[0]['fgSalesReturnInfoId'], $result[0]['gateInOutInfoId']);
    if(isset($gateInOutInfoId)){
    $rakeLoadingData = $gateService->getRakeData($gateInOutInfoId);
    $supplierVehicleData = $gateService->getSupplierVehicleData($gateInOutInfoId);
    $purchaseData = $gateService->getPurchaseData($gateInOutInfoId);
    }
    // $dataStatus = 0 ;
    if($userInfoId != 103 && ($rakeLoadingData == 1 || $supplierVehicleData == 1 || $purchaseData == 1)){
     //$dataStatus = ($waitingAt == 1 || $waitingAt == 2 || $waitingAt == 3 || $waitingAt == 4 || $waitingAt == 5 ||  $waitingAt == 10) ? true :false;
     $dataStatus = ($waitingAt == 1 || $waitingAt == 2 || $waitingAt == 3 || $waitingAt == 5) ? true :false;
     //$dataStatus = ($waitingAt == 1||$waitingAt == 4 || $waitingAt == 5) ? true :false;
     //$dataStatus = ($waitingAt == 1||$waitingAt == 8 || $waitingAt == 10) ? true :false;
       //$dataStatus = ($waitingAt == 1) ? true :false;
      // $dataStatus = false;
    }else{
      $dataStatus = count($result) > 0 ? true : false;
    }
    //$dataStatus = count($result) > 0 ? true : false;
    //$dataStatus = count($result) > 0 ? false : true;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result, "invoiceInfo" => $invoiceInfo, "weighmentImages" => $weighmentImages, "sapDeliveryInfo" => $sapDeliveryData, "salesReturnInfo" => $salesReturnInfo]);
  } 

  // Update Vehicle Status
  public function updateVehicleStatus(){

    $postData = $this->request->getJSON();
    $gateService = new GateService();		
    $masterService = new MasterService();		
    $result = $gateService->updateVehicleStatus($postData);   
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];
    $moduleTypeId = $result[3];
    $movementTypeId = $result[4];
    $subModuleTypeId = $result[5];
    $isRedirect = $result[6];
    $stoPoNo = $result[7];
    
    if($dataStatus){
      
      if($postData->moduleStatusId == 1 && isset($postData->purchaseOrderDetails)  && (($moduleTypeId == 1 || $moduleTypeId == 2) || ($movementTypeId == 1 && $moduleTypeId == 38))){
        $result = $masterService->addPurchaseOrderDetails($postData);
      }
      else if($postData->moduleStatusId == 4 && $postData->quantityDetails != ''){
        $result = $masterService->addFgReturnQuantityDetails($postData);
      }else if(($postData->moduleStatusId == 5 && $movementTypeId == 1) && ($moduleTypeId == 2 || $moduleTypeId == 6 || $moduleTypeId == 13 || $moduleTypeId == 20 || ($moduleTypeId == 5 && $postData->unloadingDetails != "") || ($stoPoNo != null && $moduleTypeId == 1 && $postData->unloadingDetails != ""))){   
if($subModuleTypeId == 3){
          $result = $gateService->addGateInInfo($postData->unloadingDetails[0]);
        }else if(($isRedirect == 0 || $isRedirect == null)){

          $masterPlantId = $postData->unloadingDetails[0]->masterPlantId;

          if(($moduleTypeId == 6 || $moduleTypeId == 20 || $moduleTypeId == 5) && ($masterPlantId == 164 || $masterPlantId == 165)){
            $result = [];
          }
          else{
            foreach($postData->unloadingDetails as $postData){
              $result = $gateService->addGateInInfo($postData);
            } 
          } 
        }
      }
      return $this->respond(["success" => true, "message" => $message]); 
    }  

    return $this->respond(["success" => false, "message"=> $message]);
  } 
      
  // Get Empty Vehicle Arraival
  public function getEmptyVehicleArraival($vehicleNo, $userInfoId) {
    $model = new GateService();
    $result = $model->getEmptyVehicleArraival($vehicleNo, $userInfoId);

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  } 

  // Get Purchase Info
  public function getPurchaseInfo($vehicleNo, $userInfoId) {
    $model = new GateService();
    $result = $model->getPurchaseInfo($vehicleNo, $userInfoId);

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }    
  
  // Get Rm Water Details
  public function getRmWaterDetails($fromDate, $toDate, $vendorName, $userInfoId) {
    $gateService = new GateService();
    $results = $gateService->getRmWaterDetails($fromDate, $toDate, $vendorName, $userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

  // Get All Gate In Info
  public function getAllGateInOutInfo($moduleStatusId, $userInfoId, $isHandCarry=null) {
    $gateService = new GateService();
    $result = $gateService->getAllGateInOutInfo($moduleStatusId, $userInfoId, $isHandCarry);
   
    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  } 

  public function getLoadingGateVehicleCountDashboard($fromDate, $toDate, $userInfoId = 0) {
    $gateService = new GateService();
    $results = $gateService->getLoadingGateVehicleCountDashboard($fromDate, $toDate, $userInfoId);

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

  // Approve Or Reject Vehicle
  public function approveOrRejectVehicle(){

    $postData = $this->request->getJSON();
    $gateService = new GateService();   
    $result = $gateService->approveOrRejectVehicle($postData);    

    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
      return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);
  }

  // Redirect Vehicle
  public function redirectVehicle(){

    $postData = $this->request->getJSON();
    $gateService = new GateService();   
    $result = $gateService->redirectVehicle($postData);

    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
      return $this->respond(["success" => true, "message" => $message]);
    }     
    return $this->respond(["success" => false, "message"=> $message]);
  }

  // Get Redirect Vehicle 
  public function getRedirectVehicle($gateInOutInfoId) {
    $gateService = new GateService();
    $result = $gateService->getRedirectVehicle($gateInOutInfoId);
    
    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get Gate pass Delivery Info
  public function getGatepassDeliveryInfo($gateInOutInfoId) {
    $gateService = new GateService();
    $result = $gateService->getGatepassDeliveryInfo($gateInOutInfoId);
 
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $data]);
  }

  // Get Purchase Return Delivery Details
  public function getPurchaseReturnDeliveryDetails($gateInOutInfoId) {
    $gateService = new GateService();
    $result = $gateService->getPurchaseReturnDeliveryDetails($gateInOutInfoId);
 
    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Add General Visitor Info
  public function addGeneralVisitorInfo() {
    
    $postData = $this->request->getJSON();    
    $gateService = new GateService();		
    $result = $gateService->addGeneralVisitorInfo($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){

      $postData->generalVisitorId = $data ? $data : $postData->generalVisitorId;
      $result = $gateService->addGeneralVisitorDetails($postData);   

      return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "data" => []]);   
  }

  // Get General Visitor Info
  public function getGeneralVisitorInfo($userInfoId) {
    $gateService = new GateService();
    $result = $gateService->getGeneralVisitorInfo($userInfoId);
  
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $data]);
  }

  // Update General Visitor Info
  public function updateGeneralVisitorInfo(){

    $postData = $this->request->getJSON();
    $gateService = new GateService();   
    $result = $gateService->updateGeneralVisitorInfo($postData);

    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
      return $this->respond(["success" => true, "message" => $message]);
    }     
    return $this->respond(["success" => false, "message"=> $message]);
  }

  // Add General Visitor Info
  public function addWorkPermit() {
  
    $postData = $this->request->getJSON();    
    $gateService = new GateService();		
    $result = $gateService->addWorkPermit($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){

      return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "data" => []]);   
  }

  // Get Work Permit Details
  public function getWorkPermit($workPermitId, $userInfoId) {
    $gateService = new GateService();
    $result = $gateService->getWorkPermit($workPermitId, $userInfoId);
    
    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Add Contractor Details
  public function addContractorDetails() {        
    $postData = $this->request->getJSON();    
    $gateService = new GateService();	
    $result = $gateService->addContractorDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if(($dataStatus) || ($dataStatus == false && $data > 0)){          
    
      $postData->contractorDetailsId = $data ? $data : $postData->contractorDetailsId;
      $result = $gateService->addContractPersons($postData);
      $result = $gateService->addContractMaterialDetails($postData);            
        
      return $this->respond(["success" => true, "message" => $message, "contractorDetailsId" => $data]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "contractorDetailsId" => $data]);   
  }

  // Add Contractor Details
  public function addContractPersonsActivity() {        
    $postData = $this->request->getJSON();    
    $gateService = new GateService();	
    $result = $gateService->addContractPersonsActivity($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        
      return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  // Get Contractor Details
  public function getContractorDetails($workPermitId, $contractorDetailsId, $userInfoId, $isReport=null) {
    $gateService = new GateService();
    $result = $gateService->getContractorDetails($workPermitId, $contractorDetailsId, $userInfoId, $isReport);
    $materialInfo = $gateService->getContractMaterialDetails($contractorDetailsId);
  
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $data, "materialInfo" => $materialInfo]);
  }

  // Update General Visitor Info
  public function updateContractPersonsActivity(){

    $postData = $this->request->getJSON();
    $gateService = new GateService();   
    $result = $gateService->updateContractPersonsActivity($postData);

    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
      return $this->respond(["success" => true, "message" => $message]);
    }     
    return $this->respond(["success" => false, "message"=> $message]);
  }

  //Get Delivery Details
  public function getDeliveryDetails($gateInOutInfoId) {
    $gateService = new GateService();    
    $result = $gateService->getGateInOutDeliveryDetails($gateInOutInfoId);
    //print_r($result);exit;
    $stoDeliveryInfo = $gateService->getStoDeliveryDetails($gateInOutInfoId);
    
    $dataStatus = count($result) > 0 || count($stoDeliveryInfo) > 0 ? true : false;
    $message = count($result) > 0 || count($stoDeliveryInfo) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "salesDeliveryInfo" => $result, "stoDeliveryInfo" => $stoDeliveryInfo]);
  } 
  
  // Get Migo Confirmation List
  public function getMigoConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId) {
    $gateService = new GateService();
    $results = $gateService->getMigoConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId);

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

   // Get Migo Confirmation List
   public function getSaleConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId) {
    $gateService = new GateService();
    $results = $gateService->getSaleConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId);

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

    // Get Canteen Material Confirmation List
    public function getCanteenConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId) {
      $gateService = new GateService();
      $results = $gateService->getCanteenConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId);
  
      $dataStatus = count($results) > 0 ? true : false;
      $message = count($results) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    //Get Canteen Material Details List
    public function getCanteenMaterialDetails($module,$subModuleTypeId) {
      $gateService = new GateService();
      $results = $gateService->getCanteenMaterialDetails($module,$subModuleTypeId);
      // print_r($results);exit;
      $dataStatus = count($results) > 0 ? true : false;
      $message = count($results) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function AddCanteenMaterialDetails() {
      $postData = $this->request->getJSON();
      $gateService = new GateService();
      $results = $gateService->AddCanteenMaterialDetails($postData);
      $dataStatus = isset($results) ? true : false;
      $message = isset($results) ? 'Data Added Successfully' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function CanteenPaymentDetailsList() {
      $gateService = new GateService();
      $results = $gateService->PaymentDetailsList();
      $dataStatus = count($results) ? true : false;
      $message = count($results) ? 'data found' : 'No data found';
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function CanteenPaymentMaterialsList($id) {
      $gateService = new GateService();
      $results = $gateService->CanteenPaymentMaterialsList($id);
      $dataStatus = count($results) ? true : false;
      $message = count($results) ? 'data found' : 'No data found';
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function UpdateCanteenMaterial() {
      $postData = $this->request->getJSON();
      $gateService = new GateService();
      $results = $gateService->UpdateCanteenMaterial($postData);
      $dataStatus = isset($results) ? true : false;
      $message = isset($results) ? 'Data Added Successfully' : 'No data found';
      $result = $results[2];
      
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
    }
    public function getVendor()
    {
      $master = new GateService();
      return  $this->sendSuccessResult($master->getVendor());
    }

    public function getCanteenReport($fromDate, $toDate, $moduleTypeId, $userInfoId) {
      $gateService = new GateService();
      $results = $gateService->getCanteenReport($fromDate, $toDate, $moduleTypeId, $userInfoId);
  
      $dataStatus = count($results) > 0 ? true : false;
      $message = count($results) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function getTrailMaterialDetails($fromDate, $toDate, $userInfoId) {
      $gateService = new GateService();
      $results = $gateService->getTrailMaterialDetails($fromDate, $toDate, $userInfoId);
      // print_r($results);exit;
      $dataStatus = count($results) > 0 ? true : false;
      $message = count($results) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }
    
    public function getCanteenAccConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId) {
      $gateService = new GateService();
      $results = $gateService->getCanteenAccConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId);
  
      $dataStatus = count($results) > 0 ? true : false;
      $message = count($results) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function CheckVendorInvoice() {
      $postData = $this->request->getJSON();
      $gateService = new GateService();
      $results = $gateService->CheckVendorInvoice($postData->invoiceNo,$postData->vendorCode,$postData->poNumber,$postData->gateId);
      $dataStatus = $results == 0 ? true : false;
      $message = $results == 0 ? 'No Issue' : 'Invoice No Already Added';
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function ExtraAttachmentCopyInsert() {
      $postData = $this->request->getJSON();
      $gateService = new GateService();
      $results = $gateService->ExtraAttachmentCopyInsert($postData);
      $dataStatus = isset($results) ? true : false;
      $message = isset($results) ? 'Data Added Successfully' : 'No data found';
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function ExtraAttachmentCopyGet($GateId) {
      $gateService = new GateService();
      $results = $gateService->ExtraAttachmentCopyGet($GateId);
      $dataStatus = isset($results) ? true : false;
      $message = isset($results) ? 'data found' : 'No data found';
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    // Get Water Material Confirmation List
    public function getWaterConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId) {
      $gateService = new GateService();
      $results = $gateService->getWaterConfirmationList($fromDate, $toDate, $moduleTypeId, $userInfoId);
  
      $dataStatus = count($results) > 0 ? true : false;
      $message = count($results) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function getVendorWater()
    {
      $master = new GateService();
      return  $this->sendSuccessResult($master->getVendorWater());
    }

    public function AddWaterTankerPayment() {
      $postData = $this->request->getJSON();
      // print_r($postData);exit;
      $gateService = new GateService();
      $results = $gateService->AddWaterTankerPayment($postData);
      $dataStatus = $results ? true : false;
      $message = $results ? 'Data Added Successfully' : 'Contact Admin';

      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function getWaterList($fromDate, $toDate, $moduleTypeId, $userInfoId) {
      $gateService = new GateService();
      $results = $gateService->getWaterList($fromDate, $toDate, $moduleTypeId, $userInfoId);
  
      $dataStatus = count($results) > 0 ? true : false;
      $message = count($results) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function getWaterListDetails($gate_id,$userInfoId) {
      $gateService = new GateService();
      $results = $gateService->getWaterListDetails($gate_id,$userInfoId);
      $dataStatus = count($results) > 0 ? true : false;
      $message = count($results) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }

    public function UpdateWaterTankerPayment() {
      $postData = $this->request->getJSON();
      $gateService = new GateService();
      $results = $gateService->UpdateWaterTankerPayment($postData);
      return  $this->respond($results);
    }
    // Get Rm Water Details
  public function getMultipleGateInPurchaseDetails($fromDate, $toDate, $vendorName, $userInfoId) {
    $gateService = new GateService();
    $results = $gateService->getMultipleGateInPurchaseDetails($fromDate, $toDate, $vendorName, $userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }
 public function getGateKpiDashboard(string $fromDate, string $toDate, int $GateId){
      try {
          $model = new GateService();

          // getWeekRanges returns ['range' => [...], 'weeks' => [...]]
          $weekData = $model->getWeekRanges($fromDate, $toDate);
          $weeks    = [];

          foreach ($weekData['weeks'] as $i => $range) {
              $weeks[] = [
                  'label' => 'Week - ' . str_pad($i + 1, 2, '0', STR_PAD_LEFT),
                  'from'  => $range['from'],
                  'to'    => $range['to'],
                  'month' => $range['month'],
                  'label' => $range['week_label'],
                  'rows'  => $model->getKpiRows($range['from'], $range['to'],$GateId),
              ];
          }

      // compute day window using 06:00 -> next day 06:00
      $dayFrom = date('Y-m-d', strtotime($toDate)) . ' 06:00:00';
      $dayTo = date('Y-m-d', strtotime($toDate . ' +1 day')) . ' 06:00:00';

      $results = [
        'day' => [
          'label' => 'Day – ' . date('d/m/y', strtotime($toDate)),
          'from' => $dayFrom,
          'to' => $dayTo,
          'rows'  => $model->getKpiRows($dayFrom, $dayTo, $GateId),
        ],
              'weeks' => $weeks,
              'month' => [
                  'label' => 'Month @ ' . strtoupper(date('F Y', strtotime($toDate))),
          'from' => $weekData['range']['from'],
          'to' => $weekData['range']['to'],
          'rows'  => $model->getKpiRows($weekData['range']['from'],$weekData['range']['to'],$GateId
          ),
              ],
          ];

          return $this->response->setJSON([
              'success' => true,
              'results' => $results,
          ]);

      } catch (\Throwable $e) {
          return $this->response->setJSON([
              'success' => false,
              'message' => 'Failed to load KPI data.',
          ]);
      }
  }

  // Get vehicle list for KPI cell (expects JSON POST)
  public function getVehicleList()
  {
    $postData = $this->request->getJSON(true);

    $fromDateRaw = isset($postData['fromDate']) ? $postData['fromDate'] : null;
    $toDateRaw = isset($postData['toDate']) ? $postData['toDate'] : null;
    $gateId = isset($postData['gateId']) ? (int)$postData['gateId'] : 0;
    $measure = isset($postData['measure']) ? $postData['measure'] : null;
    $metricType = isset($postData['metricType']) ? $postData['metricType'] : null; // 'total'|'within'|'over'
    $category = isset($postData['category']) ? $postData['category'] : null;

    // Normalize incoming date strings to 06:00 window: start = fromDate 06:00, end = (toDate +1 day) 06:00
    if (!$fromDateRaw || !$toDateRaw) {
      return $this->respond(["success" => false, "message" => "Invalid date range", "data" => []]);
    }

    try {
      $fromTs = strtotime($fromDateRaw);
      $toTs = strtotime($toDateRaw);
      if ($fromTs === false || $toTs === false) {
        return $this->respond(["success" => false, "message" => "Invalid date range", "data" => []]);
      }

      // start at 06:00 of the from date
      $fromDate = date('Y-m-d', $fromTs) . ' 06:00:00';
      // end at 06:00 of the day after the to date (half-open interval [fromDate, toDate))
      $toDate = date('Y-m-d', strtotime(date('Y-m-d', $toTs) . ' +1 day')) . ' 06:00:00';

    } catch (\Throwable $e) {
      return $this->respond(["success" => false, "message" => "Invalid date range", "data" => []]);
    }

    try {
      $service = new GateService();
  $results = $service->getVehicleListForKpi($fromDate, $toDate, $gateId, $measure, $metricType, $category);

  // Also return KPI counts for the same window (so frontend can use one API to get both)
  $kpiRows = $service->getKpiRows($fromDate, $toDate, $gateId);

  $dataStatus = count($results) > 0 ? true : false;
  $message = $dataStatus ? 'data found' : 'No data found';

  return $this->respond(["success" => $dataStatus, "message" => $message, "data" => $results, "kpi" => $kpiRows]);

    } catch (\Throwable $e) {
      return $this->respond(["success" => false, "message" => 'Unable to fetch vehicle list', "data" => []]);
    }
  }
   public function getDivision()
    {
   
        $master = new GateService();
        $res = $master->getDivision();
        return $this->sendSuccessResult($res);
    }
    
    public function getemplyeedetails($division=null)
    {
   
        $master = new GateService();
        $res = $master->getemplyeedetails($division);
        return $this->sendSuccessResult($res);
    }
     public function getBulkervehiclelist()
    {
   
        $master = new GateService();
        $res = $master->getBulkervehiclelist();
        return $this->sendSuccessResult($res);
    }
     public function saveCustomerWeight()
  {
    $postData = $this->request->getJSON();
    //  print_r($postData);exit;
    $masterService = new GateService();
    $res = $masterService->saveCustomerWeight($postData);
    if ($res != 0) {
      $response = [
        'success' => true,
        'message' => 'Data Updated successfully',
      ];
    } else {
      $response = [
        'success' => false,
        'message' => 'Failed to Updated data',
      ];
    }
    return $this->response->setJSON($response);
  }
    public function getRakeTruckComparisonDashboard($fromDate, $toDate)
    {
        // print_r($fromDate);
        // print_r($toDate);exit;
        $master = new GateService();
        $res = $master->getRakeTruckComparisonDashboard($fromDate, $toDate);
        return $this->sendSuccessResult($res);
    }
    
    public function getRakeTruckList()
    {
        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $master = new GateService();
        $res = $master->getRakeTruckList($postData);
        return $this->sendSuccessResult($res);
    }
}
