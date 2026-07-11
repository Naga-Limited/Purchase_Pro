<?php

namespace App\Controllers\Api\GatePro;

use App\Helpers\SapUrlHelper;
use App\Controllers\Api\BaseApiController;
use App\Models\GatePro\ReportService;

class Report extends BaseApiController
{

  // Gate In Out Report
  public function getGateInOutReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->getGateInOutReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId);
    
    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }
 public function GateProUpdate($id,$moduleStatusId,$waitingAt,$moduleType,$subModuleType,$loadingUnloadingInfoId){		
    $model = new ReportService();
		
		$data = array(
      'loadingUnloadingInfoId'=>$loadingUnloadingInfoId,
      'moduleStatusId'=>$moduleStatusId,
      'waitingAt'=>$waitingAt,
      'moduleType'=>$moduleType,
      'subModuleTypeId'=>$subModuleType,
			);
		$res = $model->GateProUpdate($data,$id);
		return  $this->respond(["success" => 1, "results" => $res]);	
	}
  
  public function siloToMillPOSortClose($PONumber){
    $model = new ReportService();
    $res = $model->siloToMillPOSortClose($PONumber);
    if($res == true){
      $message = 'Po Sort Closed';
    }else{
      $message = 'Po Already Sort Closed';
    }
		return  $this->respond(["success" => $message, "results" => $res]);	
	}

  public function EmptyVehicleStatusChange($id,$status,$isupdate){
    $model = new ReportService();
    $data = array(
			'VEHICLE_STATUS'=>$status,
      'IsUpdated'=>$isupdate,
			);
    $res = $model->EmptyVehicleStatusChange($id,$data);

		return  $this->respond([ "results" => $res]);	
	}

  public function SDIVehicleStatusChange($id,$status){
    $model = new ReportService();
    $data = array(
		'VECHICAL_STATUS'=>$status,
		 );
    $res = $model->SDIVehicleStatusChange($id,$data);

    return  $this->respond([ "results" => $res]);	
  }
  public function LoadUnloadInfo($id,$status){
    $model = new ReportService();
    $data = array(
			'statusId'=>$status,
			);
    $res = $model->LoadUnloadInfo($id,$data);

		return  $this->respond([ "results" => $res]);	
  }
  
  public function RakeLoading($id,$purchase_info_id){
    $model = new ReportService();
    $data = array(
			'purchase_info_id'=>$purchase_info_id,
			'status'=>3,
			
		);
    $res = $model->RakeLoading($id,$data);

    return  $this->respond([ "results" => $res]);	
  }
	
  // RmWater Report
   public function getRmWaterReport($fromDate, $toDate,$plant ,$userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->getRmWaterReport($fromDate,$toDate,$plant,$userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }
 
  public function PONumberLoadingCostAdd($PONumber,$LineItem,$SupplierCode,$plant,$cost){
    $model = new ReportService();
    $res = $model->PONumberCostAdd($PONumber,$LineItem,$SupplierCode,$plant,$cost);
    if($res == true){
      $message = 'Po Cost Added';
    }else{
      $message = 'Po Cost Already Maintained';
    }

		return  $this->respond(["success" => $message, "results" => $res]);	
	}

  public function PONumberUnloadCostAdd($PONumber,$LineItem,$SupplierCode,$cost){
    $model = new ReportService();
    $res = $model->PONumberUnloadCostAdd($PONumber,$LineItem,$SupplierCode,$cost);
    if($res == true){
      $message = 'Po Cost Added';
    }else{
      $message = 'Po Cost Already Maintained';
    }

		return  $this->respond(["success" => $message, "results" => $res]);	
	}
     // Cash Report
   public function getCashReportDetails($fromDate, $toDate,$plant_code,$userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->getCashReportDetails($fromDate, $toDate,$plant_code,$userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

  // Delivery Report
  public function getDeliveryReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->getDeliveryReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

  // Cash Report
  public function getPurchaseOrderReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->getPurchaseOrderReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

   // Get Gate Pass Report
	public function getGatePassReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->getGatePassReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

  // Sales Report
  public function getSalesReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId,$bulker_id,$bulkerCustomerId) {
    $reportService = new ReportService();
    $results = $reportService->getSalesReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId,$bulker_id,$bulkerCustomerId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }
  public function GatePROMigoAdd($PONumber,$MigoNumber,$va_number){
    $model = new ReportService();
    $res = $model->GatePROMigoAdd($PONumber,$MigoNumber,$va_number);
    if($res == true){
      $message = 'Migo Added';
    }else{
      $message = 'Migo Already Added';
    }

		return  $this->respond(["success" => $message, "results" => $res]);	
  }
  public function GateReject($gateId){
    $model = new ReportService();
    $res = $model->GateReject($gateId);
    if($res == true){
      $message = 'Changed';
    }else{
      $message = 'not changed';
    }
		return  $this->respond(["success" => $message, "results" => $res]);	
  }
  
  // Get General Visitor Report
  public function getGeneralVisitorReport($fromDate, $toDate, $masterPlantId, $userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->getGeneralVisitorReport($fromDate, $toDate, $masterPlantId, $userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

  // Get Key Collection Report
  public function getKeyCollectionReport($fromDate, $toDate, $masterPlantId, $userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->getKeyCollectionReport($fromDate, $toDate, $masterPlantId, $userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

  // Get Contractor Report
  public function getContractorReport($fromDate, $toDate, $masterPlantId, $userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->getContractorReport($fromDate, $toDate, $masterPlantId, $userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

    // Get Contract Persons Activity
    public function getContractPersonsActivity($contractorDetailsId) {
      $reportService = new ReportService();
      $results = $reportService->getContractPersonsActivity($contractorDetailsId);    
  
      $dataStatus = count($results) > 0 ? true : false;
      $message = count($results) > 0 ? 'data found' : 'No data found';
  
      return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
    }
    
     // Get Test Weighbridge Report
   public function getTestWeighbridgeReport($fromDate, $toDate, $masterPlantId, $userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->getTestWeighbridgeReport($fromDate, $toDate, $masterPlantId, $userInfoId);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }
  
   public function WrongWorkOrder($Date,$type,$id){
    $model = new ReportService();
    $data = array(
		'endDate'=>$Date,
	         );
    $res = $model->WrongWorkOrder($data,$type,$id);
   
    return  $this->respond(["results" => $res]);	
  }

  public function getPurchaseOrderReject($fromDate, $toDate, $userInfoId,$status) {
    $reportService = new ReportService();
    $results = $reportService->getPurchaseOrderReject($fromDate, $toDate, $userInfoId,$status);    

    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

  public function RejectIncharge() {
    $reportService = new ReportService();
    $postData = $this->request->getJSON();
    $results = $reportService->RejectIncharge($postData);    
    $dataStatus = $results == 1 ? true : false;
    $message = $results == 1 ? 'PO Rejected' : 'Contact Admin';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

  public function RejectManager() {
    $reportService = new ReportService();
    $postData = $this->request->getJSON();
    $results = $reportService->RejectManager($postData); 
    $dataStatus = $results[0] == 1 ? true : false;
    $message = $results[1];

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }

  public function getRakeseheduledetailsforreport() {
    $getdate = $this->request->getJSON();
    $fromDate = $getdate->fromDate;
    $toDate = $getdate->toDate;
    $vehicletype = $getdate->vehicle_type; 
    $plant = $getdate->plant;
    $reportService = new ReportService();
    $result = $reportService->getRakeseheduledetailsforreport($fromDate, $toDate, $vehicletype, $plant);
    return $this->respond($result);
  }
  
  public function getFgmaterialdetailsforreport() {
    $getdate = $this->request->getJSON();
    // print_r($getdate);exit;
    $fromDate = $getdate->fromDate;
    $toDate = $getdate->toDate;
    $reportService = new ReportService();
    $result = $reportService->getFgmaterialdetailsforreport($fromDate, $toDate);
    return $this->respond($result);
  }
   public function getRMSTOReport($fromDate, $toDate,$status, $userInfoId) {
 
    $reportService = new ReportService();
    $result = $reportService->getRMSTOReport($fromDate, $toDate, $userInfoId,$status);
    $dataStatus = count($result) > 0 ? true : false;
    $message = count($result) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
  }
   public function getSilotomilldetailsforreport() {
    $getdate = $this->request->getJSON();
    //  print_r($getdate);exit;
    $fromDate = $getdate->fromDate;
    $toDate = $getdate->toDate;
    
    $reportService = new ReportService();
    $result = $reportService->getSilotomilldetailsforreport($fromDate, $toDate);
    //print_r($result);exit;
    return $this->respond($result);
  }
  
  public function WeighmentReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId) {
  $reportService = new ReportService();
    $results = $reportService->WeighmentReport($fromDate, $toDate, $moduleTypeId, $masterPlantId, $waitingStatusId, $userInfoId);
    
    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }
  public function SaleReturnReport($fromDate, $toDate, $userInfoId) {
    $reportService = new ReportService();
    $results = $reportService->SaleReturnReport($fromDate, $toDate,$userInfoId);
    $dataStatus = count($results) > 0 ? true : false;
    $message = count($results) > 0 ? 'data found' : 'No data found';

    return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
  }
  public function getpolistforclosure() {  
    $reportService = new ReportService();
    $result = $reportService->getpolistforclosure();
    // print_r($result);exit;
    return $this->sendSuccessResult($result);
  } 
  public function getpolistforrevert() { 
    $getdate = $this->request->getJSON();
    //  print_r($getdate);exit;
    $fromDate = $getdate->fromDate;
    $toDate = $getdate->toDate; 
    $reportService = new ReportService();
    $result = $reportService->getpolistforrevert($fromDate,$toDate);
    // print_r($result);exit;
    return $this->sendSuccessResult($result);
  } 
  public function shortclosepo() { 
    $getdate = $this->request->getJSON();
    $reportService = new ReportService();
    $res = $reportService->shortclosepo($getdate);
    // print_r($result);exit;
     if ($res != 0) {
            $response = [
                'success' => true,
                'message' => 'Data updated successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to updated data',
            ];
        }

        return $this->response->setJSON($response);
        ;
  }
  public function revertpo() { 
    $getdate = $this->request->getJSON();
    $reportService = new ReportService();
    $res = $reportService->revertpo($getdate);
    // print_r($result);exit;
     if ($res != 0) {
            $response = [
                'success' => true,
                'message' => 'Data updated successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to updated data',
            ];
        }

        return $this->response->setJSON($response);
        ;
  }
  public function getpolistforrevertIAS() { 
    $getdate = $this->request->getJSON();
    //  print_r($getdate);exit;
    $fromDate = $getdate->fromDate;
    $toDate = $getdate->toDate; 
    $plant_id = $getdate->plant_id; 
    $reportService = new ReportService();
    $result = $reportService->getpolistforrevertIAS($fromDate,$toDate,$plant_id);
    // print_r($result);exit;
    return $this->sendSuccessResult($result);
  } 
  public function shortclosepoIAS() { 
    $getdate = $this->request->getJSON();
    $reportService = new ReportService();
    $res = $reportService->shortclosepoIAS($getdate);
    // print_r($result);exit;
     if ($res != 0) {
            $response = [
                'success' => true,
                'message' => 'Data updated successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to updated data',
            ];
        }

        return $this->response->setJSON($response);
        ;
  }
  public function revertpoIAS() { 
    $getdate = $this->request->getJSON();
    $reportService = new ReportService();
    $res = $reportService->revertpoIAS($getdate);
    // print_r($result);exit;
     if ($res != 0) {
            $response = [
                'success' => true,
                'message' => 'Data updated successfully',
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Failed to updated data',
            ];
        }

        return $this->response->setJSON($response);
        ;
  }
  public function getpolistforclosureIAS($plantId) {  
    $reportService = new ReportService();
    $result = $reportService->getpolistforclosureIAS($plantId);
    // print_r($result);exit;
    return $this->sendSuccessResult($result);
  } 
  public function AutoPoSortClosureIAS() {  
    $reportService = new ReportService();
    $result = $reportService->AutoPoSortClosureIAS();
    return $this->sendSuccessResult($result);
  }
  public function AutoPoSortClosureSilotoMill() {  
    $reportService = new ReportService();
    $result = $reportService->AutoPoSortClosureSilotoMill();
    // print_r($result);exit;
    return $this->sendSuccessResult($result);
  }
  
  public function getcustomerdetailsforbulker() {  
    $reportService = new ReportService();
    $result = $reportService->getcustomerdetailsforbulker();
    // print_r($result);exit;
    return $this->sendSuccessResult($result);
  }
}
