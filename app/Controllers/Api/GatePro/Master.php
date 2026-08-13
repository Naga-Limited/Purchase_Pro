<?php

namespace App\Controllers\Api\GatePro;

use App\Helpers\SapUrlHelper;
use App\Controllers\Api\BaseApiController;
use App\Models\FCIModel;
use App\Models\GatePro\MasterService;
use App\Models\LandingDataModel;

class Master extends BaseApiController {

  // Get Tripsheet Details For FG
  public function getTripsheetDetailsForFG(){
    $json = $this->request->getJSON();      
    $ZZVEHICLE_NO = $json->Vehicle_Number;
    $userInfoId = $json->userInfoId;
    $isMovement = $json->isMovement;
    $masterService = new MasterService();
    $MovementCheck = $masterService->getUserPlant($userInfoId); 
    $Movement = $MovementCheck[0]['isMovement'];
    if($Movement == 1 && $isMovement == 0 && $userInfoId == 150){
      $isMovements = 1;
    }else if($Movement == 1 && $isMovement == 0 && $userInfoId != 150){
      $isMovements = 0;
    }else if($Movement == 0 && $isMovement == 0){
      $isMovements = 1;
    }else if($isMovement == 1){
      $isMovements = 1;
    }else{
      $isMovements = 0;
    }
    $result = $masterService->getLoadingAndUnloadingInfo($ZZVEHICLE_NO, 0, $userInfoId, $isMovements);
    
    if(isset($result[0]['truckNo'])){
      $result =  $result;
    }else if($MovementCheck[0]['werks'] == 'DV00' && $json->fromType != 'PURCHASE'){
     $MovementCheck[0]['phoneNo'] = '';
     $MovementCheck[0]['personName'] = '';
     $MovementCheck[0]['truckNo'] = $ZZVEHICLE_NO;
     $MovementCheck[0]['movementTypeId'] = 1;
     $MovementCheck[0]['moduleTypeId'] = 39;
     $MovementCheck[0]['masterPlantId'] = $MovementCheck[0]['value'];
     $MovementCheck[0]['plantName'] = $MovementCheck[0]['plantName'];
     $MovementCheck[0]['werks'] = $MovementCheck[0]['werks'];
     $MovementCheck[0]['moduleType'] = 'FG Sales - NLDV';
    $result = $MovementCheck;
   }else if(($MovementCheck[0]['werks'] == 'MD04') && $json->fromType != 'PURCHASE'){
    $MovementCheck[0]['phoneNo'] = '';
    $MovementCheck[0]['personName'] = '';
    $MovementCheck[0]['truckNo'] = $ZZVEHICLE_NO;
    $MovementCheck[0]['movementTypeId'] = 1;
    $MovementCheck[0]['moduleTypeId'] = 43;
    $MovementCheck[0]['masterPlantId'] = $MovementCheck[0]['value'];
    $MovementCheck[0]['plantName'] = $MovementCheck[0]['plantName'];
    $MovementCheck[0]['werks'] = $MovementCheck[0]['werks'];
    $MovementCheck[0]['moduleType'] = 'FG Sales - NLMD';
    // $MovementCheck[0]['tripSheetNumber'] = $res[0]['TRIPSHEET_NO'];
    // $MovementCheck[0]['driverMobileNumber'] = $res[0]['DRIVER_PHONE_NO'];
    // $MovementCheck[0]['truckType'] = $res[0]['TRUCKTYPE'];
    // $MovementCheck[0]['shipmentOrderNo'] = $res[0]['SAP_LINE'][0]['SHIPMENTORDERNO'];
  //  if(isset($res[0]['TRIPSHEET_NO'])){
    $result = $MovementCheck;
    // }else{
    //   $result = [];
    // }
  }else if(($MovementCheck[0]['werks'] == 'MD00' || $MovementCheck[0]['werks'] == 'MD01' || $MovementCheck[0]['werks'] == 'MD02') && $json->fromType != 'PURCHASE'){
    $urlPath ="zgatepro/zfg_tripsheet/FG?sap-client=900&Vehicle_No=$ZZVEHICLE_NO";
    $data = SapUrlHelper::getWhDatas($urlPath);
    $res = json_decode($data, true);
        // print_r($res);exit;

    $MovementCheck[0]['phoneNo'] = '';
    $MovementCheck[0]['personName'] = '';
    $MovementCheck[0]['truckNo'] = $ZZVEHICLE_NO;
    $MovementCheck[0]['movementTypeId'] = 1;
    $MovementCheck[0]['moduleTypeId'] = 43;
    $MovementCheck[0]['masterPlantId'] = $MovementCheck[0]['value'];
    $MovementCheck[0]['plantName'] = $MovementCheck[0]['plantName'];
    $MovementCheck[0]['werks'] = $MovementCheck[0]['werks'];
    $MovementCheck[0]['moduleType'] = 'FG Sales - NLMD';
    $MovementCheck[0]['tripSheetNumber'] = $res[0]['TRIPSHEET_NO'];
    $MovementCheck[0]['driverMobileNumber'] = $res[0]['DRIVER_PHONE_NO'];
    $MovementCheck[0]['truckType'] = $res[0]['TRUCKTYPE'];
    $MovementCheck[0]['shipmentOrderNo'] = $res[0]['SAP_LINE'][0]['SHIPMENTORDERNO'];
   if(isset($res[0]['TRIPSHEET_NO'])){
      $result = $MovementCheck;
    }else{
      $result = [];
    }
  }else {
      $urlPath ="zgatepro/zfg_tripsheet/FG?sap-client=900&Vehicle_No=$ZZVEHICLE_NO";
      $data = SapUrlHelper::getWhDatas($urlPath);
      $res = json_decode($data, true);
      if(isset($res[0]['TRIPSHEET_NO'])){
        $result =  $res;
      }      
  }
   

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';
    // return $this->sendSuccessResult($result);
    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get Invoice Details
  public function getInvoiceDetails(){
    $json = $this->request->getJSON();      
    $INVOICE_NO = $json->invoiceNo;
    $userInfoId = $json->userInfoId;
    $masterService = new MasterService();
    $getUserModuleAccess = $masterService->getUserModuleAccess($userInfoId);

    foreach(array_filter($getUserModuleAccess,function($a)use($f){if($a["moduleTypeId"] == 3 or $a["moduleTypeId"] == 9)return $a;}) as $row){
      $moduleTypeId = $row["moduleTypeId"];      
    }

    if($moduleTypeId == 3){
      $urlPath ="ZGP_INV_DETAILS/Invoicedetails?sap-client=900&&INVOICE_NO=$INVOICE_NO"; 
    }
    else if($moduleTypeId == 9){
      $urlPath ="zgatepro/zgp_sal_ret_inv/Gatepro?sap-client=900&&INVOICE_NO=$INVOICE_NO"; 
    }
    $data = SapUrlHelper::getWhDatas($urlPath);
      $result = json_decode($data, true);

    $dataStatus = $result != [] ? true : false;
    $message = $result != [] ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "data" => $result, "moduleTypeId" => $moduleTypeId]);
  }
 
  // Add Module Type
  public function addModuleType() {	
    $postData = $this->request->getJSON();   
    $model = new MasterService();				
    $result = $model->addModuleType($postData);  
   
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }
  
  // Get Module Type
  public function getModuleType($movementTypeId = null, $userInfoId = null) {
    $model = new MasterService();
    $result = $model->getModuleType($movementTypeId, $userInfoId);

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }  	

  // Update Module Type
  public function updateModuleType() {        
    $postData = $this->request->getJSON();    
    $masterService = new MasterService();		
    $result = $masterService->updateModuleType($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){      
        
      return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }
  
  // Get Loading And Unloading Info
  public function getLoadingAndUnloadingInfo($vehicleNo, $loadingUnloadingInfoId = null, $userInfoId = null) {
    $model = new MasterService();
    $result = $model->getLoadingAndUnloadingInfo($vehicleNo, $loadingUnloadingInfoId, $userInfoId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }  
  public function getLoadingAndUnloadingInfoDetails($fromdate, $toDate, $userInfoId) {
    $model = new MasterService();
    $result = $model->getLoadingAndUnloadingInfoDetails($fromdate, $toDate, $userInfoId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  } 
  // Get Color Or Token
  public function getColorOrToken() {
    $model = new MasterService();
    $result = $model->getColorOrToken();

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  public function getMovementType() {
    $model = new MasterService();
    $result = $model->getMovementType();

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  public function getMasterRejectReason() {
    $model = new MasterService();
    $res = $model->getMasterRejectReason();
    return  $this->sendSuccessResult($res);
  }

  // Add Master Reject Reason
  public function addMasterRejectReason(){
    $postData = $this->request->getJSON();
    $masterService = new MasterService();		
    $result = $masterService->addMasterRejectReason($postData); 

    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
      return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]); 
  }

  // Update Master Reject Reason
  public function updateMasterRejectReason() {
    $postData = $this->request->getJSON(); 
    $model = new MasterService(); 
    $result = $model->updateMasterRejectReason($postData);
  
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
      return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]); 
  }

    public function getCameraDetailsPlantId($plantId) {
      $model = new MasterService();
      $result = $model->getCameraDetailsPlantId($plantId);

      $dataStatus = count($result) > 0 ? true : false;
      $message = count($result) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
    }
 
    public function addCameraDetails() {
      $postData = $this->request->getJSON(); 
      $model = new MasterService(); 
      $result = $model->addCameraDetails($postData);
      
      $dataStatus = $result[0];
      $message = $result[1];
      
      if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
      }     
      return $this->respond(["success" => false, "message"=> $message]);   
    }

   
    public function updateCameraDetails() {
        
      $postData = $this->request->getJSON();    
      $MasterService = new MasterService();		
      $result = $MasterService->updateCameraDetails($postData);  
      
      $dataStatus = $result[0];
      $message = $result[1];
      $data = $result[2];

      if($dataStatus){
          return $this->respond(["success" => true, "message" => $message]); 
      }     
      return $this->respond(["success" => false, "message"=> $message]);   
    }

    public function getColorToken() {
      $model = new MasterService();
      $res = $model->getColorToken();
      return  $this->sendSuccessResult($res);
    }


  public function addColorToken() {
        
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->addColorToken($postData);  

    $dataStatus = $result[0];
    $message = $result[1];    

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  public function updateColorToken() {
        
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->updateColorToken($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  public function getMasterGate() {
    $model = new MasterService();
    $res = $model->getMasterGate();
    return  $this->sendSuccessResult($res);
  }

  public function addMasterGate() {
          
    $postData = $this->request->getJSON();    
    $masterService = new MasterService();		
    $result = $masterService->addMasterGate($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  public function updateMasterGate() {
          
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->updateMasterGate($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  public function addCashInfo() {
          
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->addCashInfo($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

    // Add FG Sales Return Info
    public function addFgSalesReturnInfo() {        
      $postData = $this->request->getJSON();    
      $masterService = new MasterService();		
      $result = $masterService->addFgSalesReturnInfo($postData);   
      
      $dataStatus = $result[0];
      $message = $result[1];
      $data = $result[2];

      if($dataStatus){

        $postData->fgSalesReturnInfoId = $data ? $data : $postData->fgSalesReturnInfoId;
        $result = $masterService->addFgReturnQuantityDetails($postData);

          return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
      }     
      return $this->respond(["success" => false, "message"=> $message, "data" => []]);   
    }
  
    // Get FgSales Return Info
   // public function getFgSalesReturnInfo($vehicleNo = null, $userInfoId=null, $fgSalesReturnInfoId = null) {
    //  $masterService = new MasterService();
    //  $result = $masterService->getFgSalesReturnInfo($vehicleNo, $userInfoId, $fgSalesReturnInfoId);    

    //  $quantityDetails = $masterService->getFgSalesReturnQuantityDetails($fgSalesReturnInfoId,$userInfoId);
  
    //  $dataStatus = count($result) > 0 ? true : false;
    //  $message = count($result) > 0 ? 'data found' : 'No data found';
  
     // return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result, "quantityDetails" => $quantityDetails]);
   // }
    public function getFgSalesReturnInfo($vehicleNo = null, $fgSalesReturnInfoId = null, $userInfoId=null) {
      $masterService = new MasterService();
      $result = $masterService->getFgSalesReturnInfo($vehicleNo, $fgSalesReturnInfoId, $userInfoId);    

      $quantityDetails = $masterService->getFgSalesReturnQuantityDetails($fgSalesReturnInfoId);
  
      $dataStatus = count($result) > 0 ? true : false;
      $message = count($result) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result, "quantityDetails" => $quantityDetails]);
    }

  // Add Loading Unloading Info
  public function addLoadingUnloadingInfo() {        
    $postData = $this->request->getJSON();    
    $masterService = new MasterService();	
    $landingDataModel = new LandingDataModel();
    
    if(strlen($postData->truckNo)>0)
    $already_in_Check = $masterService->VehicleAlreadyInCheck($postData->truckNo);
    if(strlen($already_in_Check[0]['WERKS']) > 0){
      $message = 'VehicleAlready in - '.$already_in_Check[0]['PLANT_NAME'].'( '.$already_in_Check[0]['WERKS'].' )';
      return $this->respond(["success" => false, "message"=> $message, "loadingUnloadingInfoId" => '']);   
    }
    	
    $result = $masterService->addLoadingUnloadingInfo($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){
        
      if($postData->moduleTypeId == 22){
        $result = $landingDataModel->gatepass_delivery_info(0, $postData->GatepassDeliveryDetails, $data);
      }
      else{
        $postData->loadingUnloadingInfoId = $data ? $data : $postData->loadingUnloadingInfoId;
        $result = $masterService->addPurchaseOrderDetails($postData);
      }        
        
      return $this->respond(["success" => true, "message" => $message, "loadingUnloadingInfoId" => $data]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "loadingUnloadingInfoId" => $data]);   
  }

  // Add Loading Unloading Info
  public function updatePurchaseOrderDetails() {        
    $postData = $this->request->getJSON();    
    $masterService = new MasterService();		
    $result = $masterService->updatePurchaseOrderDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){

      return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  // Add RM Water Details
  public function addRmWaterDetails() {        
    $postData = $this->request->getJSON();    
    $masterService = new MasterService();		
    $result = $masterService->addRmWaterDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){      
      foreach($postData->rmWaterDetails as $postData){
        $result = $masterService->updateRmWaterDetails($postData);
      }        
      return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  // Get Purchase Order
  public function getPurchaseOrder($loadingUnloadingInfoId,$gateInOutInfoId=null) {
    $model = new MasterService();
    $result = $model->getPurchaseOrder($loadingUnloadingInfoId,$gateInOutInfoId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Update Loading Unloading Info
  public function updateLoadingUnloadingInfo() {        
    $postData = $this->request->getJSON();    
    $masterService = new MasterService();		
    $result = $masterService->updateLoadingUnloadingInfo($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){      
        
      return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  // Get Cash Info
  public function getCashInfo($cashInfoId) {
    $model = new MasterService();
    $result = $model->getCashInfo($cashInfoId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get User PlantId
  public function getUserPlant($userInfoId) {
    $model = new MasterService();
    $result = $model->getUserPlant($userInfoId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'Plant Not Assigned, Please Assign';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // get Po Details
  public function getPoDetails(){
    $postData = $this->request->getJSON();      
    $PO_NO = $postData->poNumber;   
    $moduleTypeId = $postData->moduleTypeId;   
    $subModuleTypeId = $postData->subModuleTypeId;   

    if($moduleTypeId == 6 || $moduleTypeId == 13 || $moduleTypeId == 20 || $moduleTypeId == 44){
      $urlPath ="zgatepro/zss_po_detail/Gatepro?sap-client=900&&PO_Number=$PO_NO";
      $data = SapUrlHelper::getWhDatas($urlPath);
      $result = json_decode($data, true); 
    }
    else if($moduleTypeId == 12 || $moduleTypeId == 25 || $moduleTypeId == 14 || $subModuleTypeId == 5 || $moduleTypeId == 15 || $moduleTypeId == 21 || $moduleTypeId == 34 || $moduleTypeId == 35 || $moduleTypeId == 33 || $moduleTypeId == 16 ||$moduleTypeId == 41 || $moduleTypeId == 38){
      $urlPath ="zgatepro/ZGP_Unloading/Gatepro_Fg_Uloading?sap-client=900&&Po_No=$PO_NO";
      //103.249.96.242:50000/zgatepro/ZGP_Unloading/Gatepro_Fg_Uloading?sap-client=900&&Po_No=1500005992
      $data = SapUrlHelper::getWhDatas($urlPath);
      $result = json_decode($data, true); 
    }     

    $dataStatus = $result != [] ? true : false;
    $message = $result != [] ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "data" => $result]);
   }

   public function addUserModuleAccess() {
          
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->addUserModuleAccess($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message, "data"=> $data]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "data"=> $data]);   
  }
  
  public function updateUserGate() {        
    $postData = $this->request->getJSON();    
    $masterService = new MasterService();		
    $result = $masterService->updateUserGate($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){      
        
      return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  public function getUserModuleAccess($userInfoId = null) {
    $model = new MasterService();
    $result = $model->getUserModuleAccess($userInfoId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get User Gate Info 
  public function getUserGateInfo() {
    $masterService = new MasterService();
    $result = $masterService->getUserGateInfo();    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  } 

  // Check Master Plant
  public function checkMasterPlant($werks) {
    $masterService = new MasterService();
    $result = $masterService->checkMasterPlant($werks);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'Plant Not Maintained';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }   

  // Get Po Type
  public function getPoType($poType = null) {
    $masterService = new MasterService();
    $result = $masterService->getPoType($poType);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'PO Type Not Maintained';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }  
  
  // Get Master Plant
  public function getMasterPlant() {
    $masterService = new MasterService();
    $result = $masterService->getMasterPlant();    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }   

  // Add Gate In Out History
  public function addGateInOutHistory() {
        
    $postData = $this->request->getJSON();    
    $masterService = new MasterService();		
    $result = $masterService->addGateInOutHistory($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message, "data"=> $data]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "data"=> $data]);   
  }

  // Get Po Type Details
  public function getPoTypeDetails() {
    $masterService = new MasterService();
    $result = $masterService->getPoTypeDetails();    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }   

  // Add Po Type Details
  public function addPoTypeDetails() {
          
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->addPoTypeDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message, "data"=> $data]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "data"=> $data]);   
  }

  // Update Po Type Details
  public function updatePoTypeDetails() {
          
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->updatePoTypeDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message, "data"=> $data]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "data"=> $data]);   
  }

  // Get Vendor Details
  public function getVendorDetails($fromDate, $toDate, $userInfoId) {
    $masterService = new MasterService();
    $results = $masterService->getVendorDetails($fromDate, $toDate, $userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

   // Get Sub Module Type
   public function getSubModuleType($moduleTypeId) {
    $masterService = new MasterService();
    $result = $masterService->getSubModuleType($moduleTypeId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get Gate Pass Details
	public function getGatePassDetails(){
		$dataStatus = false;
		$json = $this->request->getJSON(); 
		$gatePassNo = $json->gatePassNo;
		$masterService = new MasterService();
		
		$urlPath ="zgatepro/zsap_pp_gatepas/gatepass?sap-client=900&gatepass_no=$gatePassNo";
		$res = SapUrlHelper::getWhDatas($urlPath);
		$result = json_decode($res);			
		
    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';		
		
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}


  // Get Meeting Type
  public function getMeetingType() {
    $masterService = new MasterService();
    $result = $masterService->getMeetingType();    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }   

  // Get Key Details
  public function getKeyDetails() {
    $masterService = new MasterService();
    $result = $masterService->getKeyDetails();    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }   

  // Get Employee Details
  public function getEmployeeDetails($userInfoId) {
    $masterService = new MasterService();
    $result = $masterService->getEmployeeDetails($userInfoId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

    // Add Key Collection Details
public function addKeyCollectionDetails() {  

    $postData = $this->request->getJSON();
    $otp = rand(1000, 9999);   

    $masterService = new MasterService();		
    $result = $masterService->addKeyCollectionDetails($postData, $otp);  

    $dataStatus = $result[0];
    $message1 = $result[1];
    $lastid = $result[2];

    $result2 = $masterService->getkeydetailforotp($lastid);

    if (!empty($result2)) {

        $otpValue = $result2[0]['otp'];
        $res_mobilenumber = $result2[0]['mobile_number'];

        if ($res_mobilenumber) {

            $message = "Your OTP for collecting the key is ".$otpValue.". Please do not share this OTP with others Naga Limited.";

            $msg = urlencode($message);

            $sender = 'NAGACO';

            $headers = array('Content-Type: application/json; charset=utf-8');

            $url = "http://mobicomm.dove-sms.com/submitsms.jsp?user=NAGACO"
                ."&key=eee5461574XX"
                ."&message=".$msg
                ."&senderid=".$sender
                ."&accusage=1"
                ."&entityid=1201159186592875505"
                ."&tempid=1207177373663819918"
                ."&unicode=1"
                ."&mobile=".$res_mobilenumber;

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $curlresponse = curl_exec($ch);
            curl_close($ch);
        }
    }

    if ($dataStatus) {
        return $this->respond([
            "success" => true,
            "message" => $message1
        ]);
    }

    return $this->respond([
        "success" => false,
        "message" => $message1
    ]);
}

  // Get Key Collection Details
  public function getKeyCollectionDetails($userInfoId) {  
    $masterService = new MasterService();
    $result = $masterService->getKeyCollectionDetails($userInfoId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get Work Nature
  public function getWorkNature() {  
    $masterService = new MasterService();
    $result = $masterService->getWorkNature();    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get Shift
  public function getShift() {  
    $masterService = new MasterService();
    $result = $masterService->getShift();    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get Definitions
  public function getDefinitions($isMaster=null) {  
    $masterService = new MasterService();
    $result = $masterService->getDefinitions($isMaster);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get Definitions List
  public function getDefinitionsList($definitionsId, $isMaster=null) {  
    $masterService = new MasterService();
    $result = $masterService->getDefinitionsList($definitionsId, $isMaster);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Add Definitions
  public function addDefinitions() {
        
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->addDefinitions($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  // Add Definitions Details
  public function addDefinitionsDetails() {
          
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->addDefinitionsDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  // Update Definitions
  public function updateDefinitions() {
        
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->updateDefinitions($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message, "data"=> $result]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "data"=> $result]);   
  }
  
  // Update Definitions Details
  public function updateDefinitionsDetails() {
        
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->updateDefinitionsDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message, "data"=> $result]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "data"=> $result]);   
  }

    // Delete Purchase Order Details
    public function deletePurchaseOrderDetails() {
        
      $postData = $this->request->getJSON();    
      $MasterService = new MasterService();		
      $result = $MasterService->deletePurchaseOrderDetails($postData);  
      
      $dataStatus = $result[0];
      $message = $result[1];
  
      if($dataStatus){
          return $this->respond(["success" => true, "message" => $message, "data"=> $result]); 
      }     
      return $this->respond(["success" => false, "message"=> $message, "data"=> $result]);   
    }
  // Get Return Delivery Details
  public function getReturnDeliveryDetails($gateInOutInfoId) {  
    $masterService = new MasterService();
    $result = $masterService->getReturnDeliveryDetails($gateInOutInfoId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get PoType Access
  public function getPoTypeAccess($userInfoId, $isDropdown=null, $masterPlantId=null) {  
    $masterService = new MasterService();
    $result = $masterService->getPoTypeAccess($userInfoId, $isDropdown, $masterPlantId);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  public function addPoTypeAccess() {
          
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->addPoTypeAccess($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];
    $data = $result[2];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message, "data"=> $data]); 
    }     
    return $this->respond(["success" => false, "message"=> $message, "data"=> $data]);   
  }

  // Migo Button Disabled
  public function migoButtonDisabled($masterGateId) {  
    
    $dataStatus = $masterGateId == 17 ? false : true;

    return  $this->respond(["isButtonDisabled" => $dataStatus]);
  }

  // hide Purchase
  public function hidePurchaseScreen($masterGateId) {  
    
    $dataStatus = $masterGateId > 30 ? false : true;

    return  $this->respond(["isHide" => $dataStatus]);
  }

  // Reject Button Disabled
  public function hideRejectButton($masterGateId) {
    
    $dataStatus = $masterGateId == 17 ? true : false;

    return  $this->respond(["isHide" => $dataStatus]);
  }

  public function deleteFgSalesReturnInfo() {
          
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();		
    $result = $MasterService->deleteFgSalesReturnInfo($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  // Delete Invoice Details
  public function deleteInvoiceDetails() {
    
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();   
    $result = $MasterService->deleteInvoiceDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  public function deleteInvoiceDetail() {
    
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();   
    $result = $MasterService->deleteInvoiceDetail($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }
  
  // Add Employee Details
  public function addEmployeeDetails() {
          
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();   
    $result = $MasterService->addEmployeeDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  // Update Employee Details
  public function updateEmployeeDetails() {
        
    $postData = $this->request->getJSON();    
    $MasterService = new MasterService();   
    $result = $MasterService->updateEmployeeDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){
        return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }

  // Check Invoice Details
  public function checkInvoiceDetails($invoiceNo) {  
    $masterService = new MasterService();
    $result = $masterService->checkInvoiceDetails($invoiceNo);

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  // Get Module Status
  public function getModuleStatus() {  
    $masterService = new MasterService();
    $result = $masterService->getModuleStatus();

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  public function getVendorPlant($vendorCode) {  
    $masterService = new MasterService();
    $result = $masterService->getVendorPlant($vendorCode);    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  public function QRCodeControl($userid) {  
    $masterService = new MasterService();
    $gate_id = $masterService->QRCodeControl($userid);
    $active = $masterService->ActiveStatus($gate_id[0]['masterGateId']);
    $active1 = $masterService->ActiveStatusGate($gate_id[0]['masterGateId']);
    $active2 = $masterService->ActiveStatusGateOut($gate_id[0]['masterGateId']);     
    $active3 = $masterService->MasterGateByID($gate_id[0]['masterGateId']); 
    $active3 = $active3[0]['workingProcess'];
    $pp_setting = $masterService->PPSetting();    
    $result = false;
    $result1 = false;
    $result2 = false;

    if(($active) && $pp_setting[0]['qr_control'] == 1){
      $result = true;
    }
    if(($active1) && $pp_setting[0]['qr_control'] == 1){
      $result1 = true;
    }
    if(($active2) && $pp_setting[0]['qr_control'] == 1){
      $result2 = true;
    }
    return  $this->respond(["success" => '1',"results" => $result,'gate_id'=>$gate_id[0]['masterGateId'],'gatein'=>$result1,'gateout'=>$result2,'workingProcess'=>$active3]);
  }

  public function LoadUnloadInfoDetailsById($ID) {  
    $masterService = new MasterService();
    $Address = new FCIModel();

    $result = $masterService->LoadUnloadInfoDetailsById($ID);
    $address = $Address->CompanyAddressDetails($result[0]['werks']);

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result , "address"=>$address]);
  }

  public function SupplierVehicleInfoById($ID) {  
    $masterService = new MasterService();
    $Address = new FCIModel();

    $result = $masterService->SupplierVehicleInfoById($ID);
    $address = $Address->CompanyAddressDetails($result[0]['PLANT_ID']);

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result , "address"=>$address]);
  }
  // Add Loading Unloading Info
  public function updateTrailPurchaseOrderDetails() {     
    $postData = $this->request->getJSON();    
    $masterService = new MasterService();		
    $result = $masterService->updateTrailPurchaseOrderDetails($postData);  
    
    $dataStatus = $result[0];
    $message = $result[1];

    if($dataStatus){

      return $this->respond(["success" => true, "message" => $message]); 
    }     
    return $this->respond(["success" => false, "message"=> $message]);   
  }
  public function getSTMQCMaster() {  
    $masterService = new MasterService();
    $result = $masterService->getSTMQCMaster();    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  public function getIASQCMaster() {  
    $masterService = new MasterService();
    $result = $masterService->getIASQCMaster();    

    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }

  public function importQCMaster()
  {
      $json = $this->request->getJSON(true);

      $userId      = $json['userId'] ?? null;
      $plantId     = $json['plantId'] ?? null;
      $processType = $json['processType'] ?? '';
      $data        = $json['data'] ?? [];
      $rowCount    =  count($data);
      if(($rowCount == 3 && $processType === 'IAS') || ($rowCount == 12 && $processType === 'SILO_TO_MILL')){
      if (empty($data)) {
          return $this->response->setJSON([
              'success' => false,
              'message' => 'No data found in request.'
          ]);
      }

      // Choose table dynamically
      $tableName = ($processType === 'SILO_TO_MILL') ? 'master_quality_check_stm' : 'master_quality_check_ias';

      $db = db_connect();
      $builder = $db->table($tableName);

      foreach ($data as $row) {
          $material  = !empty($row['MATERIAL']) ? trim($row['MATERIAL']) : null;
          $uom       = !empty($row['UOM']) ? $row['UOM'] : null;
          $minVal    = !empty($row['MIN VALUE']) ? $row['MIN VALUE'] : null;
          $maxVal    = !empty($row['MAX VALUE']) ? $row['MAX VALUE'] : null;
          $inputType = !empty($row['INPUT TYPE']) ? $row['INPUT TYPE'] : null;
          $nirYes    = !empty($row['NIR YES']) ? $row['NIR YES'] : null;
          $nirNo     = !empty($row['NIR NO']) ? $row['NIR NO'] : null;
          $nirFoss   = !empty($row['NIR FOSS']) ? $row['NIR FOSS'] : null;
          $surveyor  = !empty($row['SURVEYOR']) ? $row['SURVEYOR'] : null;
          $fieldMap  = !empty($row['FIELD MAP']) ? $row['FIELD MAP'] : null;
          $miscDes   = !empty($row['MIC DESC']) ? $row['MIC DESC'] : null;
          $misc      = !empty($row['MIC']) ? $row['MIC'] : null;
          $DEDUCTION = !empty($row['DEDUCTION']) ? $row['DEDUCTION'] : null;
          // print_r($uom);exit;
          if ($material === '') continue;

          // Check if record exists
          $existing = $builder->where([
              'IDNLF'   => $material,
              'FIELD_MAP' => $fieldMap
          ])->get()->getRowArray();
          $rowData = [
              'IDNLF'      => $material,
              'UOM'        => $uom,
              'MIC'        => $misc,
              'MIN_VALUE'  => $minVal,
              'MAX_VALUE'  => $maxVal,
              'nir_yes'    => $nirYes,
              'nir_no'     => $nirNo,
              'nir_foss'   => $nirFoss,
              'surveyor'   => $surveyor,
              'FIELD_MAP'  => $fieldMap,
              'MIC_DESC'   => $miscDes,
              'input_type' => $inputType,
              'DeductionSpec'=>$DEDUCTION,
              'ModBy'      => $userId,
              'ModDt'      => date('Y-m-d H:i:s'),
          ];
          // print_r($rowData);exit;
          if ($existing) {
              // Update
              $builder->where('QCM_REFID', $existing['QCM_REFID'])->update($rowData);
          } else {
              // Insert
              $rowData['InsBy'] = $userId;
              $rowData['InsDt'] = date('Y-m-d H:i:s');
              $builder->insert($rowData);
          }
      }

      return $this->response->setJSON([
          'success' => true,
          'message' => 'QC Master data imported successfully'
      ]);
    }else{
      return $this->response->setJSON([
          'success' => false,
          'message' => "Invalid row count for $processType: $rowCount columns found."
      ]);
    }
  }
   public function getBulkermasterlist()
  {

    $master = new MasterService();
    $res = $master->getBulkermasterlist();
    return $this->sendSuccessResult($res);
  }
  public function InsertBulkerdetails()
  {
    $postData = $this->request->getJSON();

    $masterService = new MasterService();

    // Check duplicate bulker number
    $data = $masterService->chechbulkernumber($postData->bulkerNo);

    // If duplicate exists
    if ($data > 0) {
      return $this->sendErrorResult("Please Check its a duplicate entry");
    }

    // Insert if no duplicate
    $res = $masterService->InsertBulkerdetails($postData);

    if ($res != 0) {
      $response = [
        'success' => true,
        'message' => 'Data inserted successfully',
      ];
    } else {
      $response = [
        'success' => false,
        'message' => 'Failed to insert data',
      ];
    }

    return $this->response->setJSON($response);
  }

  public function UpdateBulkerdetails()
  {
    $postData = $this->request->getJSON();
    //  print_r($postData);exit;
    $masterService = new MasterService();
    $res = $masterService->UpdateBulkerdetails($postData);
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

  public function DeleteBulkerdetails()
  {
    $postData = $this->request->getJSON();
    //  print_r($postData);exit;
    $master = new MasterService();
    $res = $master->DeleteBulkerdetails($postData);
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
  public function RevertBulkerdetails()
  {
    $postData = $this->request->getJSON();
    //  print_r($postData);exit;
    $master = new MasterService();

    $res = $master->RevertBulkerdetails($postData);
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

   public function getGateKeyList()
  {

    $master = new MasterService();
    $res = $master->getGateKeyList();
    return $this->sendSuccessResult($res);
  }

  public function getGateList($gateid=null)
  {

    $master = new MasterService();
    $res = $master->getGateList($gateid);
    return $this->sendSuccessResult($res);
  }
public function getkeyListbyuser($gateid= null)
  {

    $master = new MasterService();
    $res = $master->getkeyListbyuser($gateid);
    return $this->sendSuccessResult($res);
  }
  
  public function getDataTypes()
  {

    $master = new MasterService();
    $res = $master->getDataTypes();
    return $this->sendSuccessResult($res);
  }

  public function InsertGateKeydetails()
  {
    $postData = $this->request->getJSON();
    // print_r($postData);exit;

    $masterService = new MasterService();

    // Check duplicate bulker number
    $data = $masterService->checkkeylist($postData->key_name,$postData->gate_id);

    // If duplicate exists
    if ($data > 0) {
      return $this->sendErrorResult("Please Check its a duplicate entry");
    }

    // Insert if no duplicate
    $res = $masterService->InsertGateKeydetails($postData);

    if ($res != 0) {
      $response = [
        'success' => true,
        'message' => 'Data inserted successfully',
      ];
    } else {
      $response = [
        'success' => false,
        'message' => 'Failed to insert data',
      ];
    }

    return $this->response->setJSON($response);
  }

  public function UpdateGateKeydetails()
  {
    $postData = $this->request->getJSON();
    //  print_r($postData);exit;
    $masterService = new MasterService();
    $res = $masterService->UpdateGateKeydetails($postData);
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

   public function DeleteGateKey()
  {
    $postData = $this->request->getJSON();
    //  print_r($postData);exit;
    $master = new MasterService();
    $res = $master->DeleteGateKey($postData);
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
  public function RevertGateKey()
  {
    $postData = $this->request->getJSON();
    //  print_r($postData);exit;
    $master = new MasterService();

    $res = $master->RevertGateKey($postData);
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
public function insertRegister()
  {
    $postData = $this->request->getJSON();
    // print_r($postData);exit;

    $masterService = new MasterService();

    // Check duplicate bulker number
    $data = $masterService->checkregisterlist($postData->register_name,$postData->plant_ids);

    // If duplicate exists
    if ($data > 0) {
      return $this->sendErrorResult("Please Check its a duplicate entry");
    }

    // Insert if no duplicate
    $res = $masterService->insertRegister($postData);

    if ($res != 0) {
      $response = [
        'success' => true,
        'message' => 'Data inserted successfully',
      ];
    } else {
      $response = [
        'success' => false,
        'message' => 'Failed to insert data',
      ];
    }

    return $this->response->setJSON($response);
  }

  public function getRegisterList()
  {

    $master = new MasterService();
    $res = $master->getRegisterList();
    return $this->sendSuccessResult($res);
  }

  public function updateRegister()
  {
    $postData = $this->request->getJSON();
     print_r($postData);exit;
    $masterService = new MasterService();
    $res = $masterService->updateRegister($postData);
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
 
  public function verifyKeyOTP()
{
    $postData = $this->request->getJSON();

    $masterService = new MasterService();

    $result = $masterService->verifyKeyOTP($postData);

    return $this->respond([
        "success" => $result[0],
        "message" => $result[1]
    ]);
}

}
