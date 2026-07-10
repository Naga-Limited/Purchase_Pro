<?php

namespace App\Controllers\Api\GatePro;

use App\Helpers\SapUrlHelper;
use App\Controllers\Api\BaseApiController;
use App\Models\GatePro\DocumentService;

class Document extends BaseApiController
{
  
    // Inserting Document In Information
    public function addSAPDocument() {
        
        $postData = $this->request->getJSON();    
        $documentService = new DocumentService();		
        $result = $documentService->addSAPDocument($postData);  
        
        $dataStatus = $result[0];
        $message = $result[1];
        $data = $result[2];

        if($dataStatus){
            return $this->respond(["success" => true, "message" => $message, "data" => $data]); 
        }     
        return $this->respond(["success" => false, "message"=> $message, "data" => []]);   
    }

    public function getSapDocumentDetails() {
        $model = new DocumentService();
        $result = $model->getSapDocumentDetails();
        // return  $this->sendSuccessResult($res);

        $dataStatus = count($result) > 0 ? true : false;
        $message = count($result) > 0 ? 'data found' : 'No data found';
        //  return $this->sendSuccessResult($result);
        return  $this->respond(["success" => $dataStatus, "message" => $message, "data" => $result]);     
    }
 public function sendEmail(){
        $postData = $this->request->getJSON();    
        $model = new DocumentService();
        $res = $model->sendEmail($postData);

        if($res){
          return $this->sendSuccessResult($res);
        }
        return $this->sendErrorResult("Please Enter Correct User Name");
    }
    public function getfgdelaytimeinfo($vehicleType){
        
        // print_r($vehicleType);exit;    
        $model = new DocumentService();
        $res = $model->getfgdelaytimeinfo($vehicleType);

        if($res){
          return $this->sendSuccessResult($res);
        }
        return $this->sendErrorResult("No data found");
    }
    public function migoapprovaldata(){
        
        $postData= null; 
        $postData = $this->request->getJSON(); 
        //print_r($postData);exit;     
        $model = new DocumentService();
        $res = $model->migoapprovaldata($postData);

        if($res){
          return $this->sendSuccessResult($res);
        }
        return $this->sendErrorResult("No data found");
    }
    public function getSupplierLoadingDateList() {
		$gateService = new DocumentService();   
		$json = $this->request->getJSON(); 
		$result = $gateService->getSupplierLoadingDateList();
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

    public function updateSupplierLoadingDelay() {
        
        $postData = $this->request->getJSON();    
        $MasterService = new DocumentService();	
        $result = $MasterService->updateSupplierLoadingDelay($postData);  
 
        if($result > 0){
            return $this->respond(["success" => true, "message" => 'Submitted Successfully', "data"=> $result]); 
        }else{
            return $this->respond(["success" => false, "message"=> 'Please Contact Admin', "data"=> $result]);   
        }     
    }
}
