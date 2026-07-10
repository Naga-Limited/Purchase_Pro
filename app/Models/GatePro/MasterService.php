<?php

namespace App\Models\GatePro;

use CodeIgniter\Model;
use App\Helpers\SapUrlHelper;
use App\Helpers\PDFConvertor;

class MasterService extends Model
{ 
	public function addActivity($postData) {  
    $sql = "CALL spInsActivityLog(?, ?)";
		$activity = $postData->activity;
		$userInfoId = $postData->userInfoId;
		$result = $this->db->query($sql, [$userInfoId, $activity]);
		if ($result->resultID >= 1) {
			return true;
		}	
		return false;
	}

  // Add Module Type
  public function addModuleType($postData) {  
		$dataStatus = false;
		$data = $message = null;
		
		$sql = "CALL spInsModuleType(?, ?, ?)";
		$builder = $this->db->query($sql, [$postData->movementTypeId, $postData->moduleType, $postData->userInfoId]);    
		
		$queryResult = $builder->getResultArray();
		$lastInsertId= (int)$queryResult[0]['lastInsertId'];
    $getExistCount = (int)$queryResult[0]['getExistCount'];

		if($lastInsertId > 0 &&  $getExistCount == 0 ){
			$dataStatus = true;
			$message = "Module Type Added";
		}
		elseif($lastInsertId == 0 &&  $getExistCount > 0){
			$message = "Module Type Already Added";
		}
		else{
			$message = "Please contact Admin.";
		}
		
		return array($dataStatus, $message);
  }

  // Get Module Type
  public function getModuleType($movementTypeId = null, $userInfoId = null) {     
    $builder = $this->db->query("CALL spSelModuleType('$movementTypeId', '$userInfoId')");
    return  $builder->getResultArray();
  }

  // Update Module Type
  public function updateModuleType($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spUpdModuleType(?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->moduleTypeId, $postData->moduleType, $postData->isActive, $postData->userInfoId]);

    $queryResult = $builder->getResultArray();
    $dataCount = (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 && $countRow > 0){
      $dataStatus = true;
      $message = "Module Type Updated";        
    }
    else if($dataCount > 0 && $countRow == 0){
      $message = "No update has been made";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);  
  }
  
  public function getLoadingAndUnloadingInfo($vehicleNo, $loadingUnloadingInfoId = null, $userInfoId = null ,$movementTypeId = null) {
    $builder =  $this->db->query("CALL spSelLoadingAndUnloadingInfo('$vehicleNo', '$loadingUnloadingInfoId', '$userInfoId','$movementTypeId')");
    return  $builder->getResultArray();
  }  
  public function getLoadingAndUnloadingInfoDetails($fromdate, $todate, $userInfoId) {
        $fromDateMilliSecond = $fromdate / 1000;
        $toDateMilliSecond = $todate / 1000;
        $fromDate = date("Y-m-d", $fromDateMilliSecond);
        $toDate = date("Y-m-d", $toDateMilliSecond);
        
        $builders = $this->db->table("pp_setting");
        $builders = $builders->select("migoDaysControl");
        $builders =  $builders->where("id",1);
        $builders = $builders->distinct()->get()->getResultArray();

        $migoDaysControl = $builders[0]['migoDaysControl'];

        $cnd="";
        $builder = $this->db->table("user_info");
        $builder = $builder->select("masterGateId");
        $builder =  $builder->where("UI_ID",$userInfoId);
        $builder = $builder->distinct()->get()->getResultArray();
        $masterGateId = $builder[0]['masterGateId'];

        if($todate != 0 && $userInfoId !=1){
          $cnd .= "lui.createdOn >= '$fromDate' and lui.createdOn <= date_add('$toDate', INTERVAL 1 DAY) AND lui.moduleTypeId NOT IN(12,21,33,34,16,6,20) and lui.statusId != 8";
        }else if($todate != 0 && $userInfoId ==1){
          $cnd .= "lui.createdOn >= '$fromDate' and lui.createdOn <= date_add('$toDate', INTERVAL 1 DAY)";
        }else if($todate == 0 && $fromdate == 0){
          $cnd .= "gioi.createdOn >=  curdate() - INTERVAL '$migoDaysControl' DAY AND gioi.createdOn < curdate() + INTERVAL '1' DAY";
        }
        if($userInfoId != 1 && $masterGateId != 17 && $masterGateId != 18 && $todate == 0){
          $cnd .= " AND gioi.masterPlantId IN (SELECT p.PLANT_ID FROM master_user_plant p WHERE p.USER_ID = $userInfoId) AND lui.moduleTypeId IN (SELECT m.moduleTypeId FROM user_module_access m WHERE m.userInfoId = $userInfoId) AND lui.statusId > 1 AND lui.moduleTypeId NOT IN (12,21,33,34)";
        }else if($userInfoId != 1 && ($masterGateId == 17 || $masterGateId == 18) && $todate == 0){
          $cnd .= " AND gioi.masterPlantId IN (SELECT p.PLANT_ID FROM master_user_plant p WHERE p.USER_ID = $userInfoId) AND lui.moduleTypeId IN (SELECT m.moduleTypeId FROM user_module_access m WHERE m.userInfoId = $userInfoId UNION SELECT 15) AND lui.statusId > 1 AND lui.moduleTypeId NOT IN (12,21,33,34)";
        }else if($userInfoId != 1 && $masterGateId != 17 && $masterGateId != 18 && $todate != 0){
          $cnd .= " AND lui.masterPlantId IN (SELECT p.PLANT_ID FROM master_user_plant p WHERE p.USER_ID = $userInfoId) AND lui.moduleTypeId IN (SELECT m.moduleTypeId FROM user_module_access m WHERE m.userInfoId = $userInfoId) AND lui.moduleTypeId NOT IN (12,21,33,34)";
        }else if($userInfoId != 1 && ($masterGateId == 17 || $masterGateId == 18) && $todate != 0){
          $cnd .= " AND lui.masterPlantId IN (SELECT p.PLANT_ID FROM master_user_plant p WHERE p.USER_ID = $userInfoId) AND lui.moduleTypeId IN (SELECT m.moduleTypeId FROM user_module_access m WHERE m.userInfoId = $userInfoId) AND lui.moduleTypeId NOT IN (12,21,33,34)";
        }

      $fetchsql = "SELECT 
      lui.id AS loadingAndUnloadingInfoId, lui.movementTypeId, lui.moduleTypeId, mm.moduleType, lui.masterPlantId, 
      mp.PLANT_NAME AS plantName, lui.personName, lui.phoneNo, lui.eda, lui.remarks, lui.fromDate, lui.toDate, 
      lui.statusId, ps.StatusName, lui.createdBy, lui.createdOn, lui.tripSheetNo, lui.masterPlantId AS value, 
      lui.cashInvoiceNo, lui.isGateIn, lui.subModuleTypeId, mp.WERKS AS werks, lui.isWeight, lui.isApproved, 
      ms.statusName AS waitingStatus, lui.sampleMaterial, lui.quantity,
      case when lui.movementTypeId = 1 then 'LOADING' ELSE 'UNLOADING' END AS movementType,
      case when lui.subModuleTypeId = 9 then tw.vehicleNo ELSE lui.truckNo END AS truckNo,
      case when lui.subModuleTypeId = 9 then tw.vaNumber ELSE gioi.vaNumber END AS vaNumber
      
       FROM loading_unloading_info lui
       LEFT JOIN master_module mm on mm.id = lui.moduleTypeId						 	
       LEFT JOIN master_plant mp on mp.ID = lui.masterPlantId
       LEFT JOIN pp_status ps on ps.Id = lui.statusId
       LEFT JOIN gate_in_out_info gioi on gioi.loadingUnloadingInfoId = lui.id
       LEFT JOIN module_status ms on ms.id = gioi.waitingAt
       LEFT JOIN test_weighbridge tw on tw.loadingUnloadingInfoId = lui.id
       WHERE $cnd";
      // print_r($fetchsql);exit;
     $builder =  $this->db->query($fetchsql);

    return  $builder->getResultArray();
  }  
  public function getColorOrToken() {     
    $builder = $this->db->query("CALL spSelColorOrToken()");
    return  $builder->getResultArray();
  }  

  public function getMovementType() {     
    $builder = $this->db->query("CALL spSelMovementType()");
    return  $builder->getResultArray();
  }

  public function getMasterRejectReason() {     
    $builder = $this->db->query("CALL spSelMasterRejectReason()");
    return  $builder->getResultArray();
  }

  // Add Master Reject Reason
  public function addMasterRejectReason($postData) { 

    $sql = "CALL spInsMasterRejectReason(?, ?)";   
    $builder = $this->db->query($sql, [$postData->rejectReason, $postData->userInfoId]);
    
    $queryResult = $builder->getResultArray();
		$countRow = (int)$queryResult[0]['countRow'];
		$lastInsertId = (int)$queryResult[0]['lastInsertId'];
    $getExistCount = (int)$queryResult[0]['getExistCount'];

		if($countRow > 0 && $lastInsertId > 0 && $getExistCount == 0){
			$dataStatus = true;
			$message = "Reject Reason Added";
		}
		elseif($countRow > 0 && $lastInsertId == 0 && $getExistCount > 0){
			$message = "Reject Reason Already Added";
		}
		else{
			$message = "Please contact Admin.";
		}
		
		return array($dataStatus, $message);
  }

  // Update Master Reject Reason
  public function updateMasterRejectReason($postData) { 

    $sql = "CALL spUpdMasterRejectReason(?, ?, ?, ?)";   
    $builder = $this->db->query($sql, [$postData->masterRejectReasonId, $postData->rejectReason, $postData->isActive, $postData->userInfoId]);
    
    $queryResult = $builder->getResultArray();      
    $dataCount = (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 && $countRow > 0){
      $dataStatus = true;
      $message = "Reject Reason Updated";
    }
    elseif($dataCount > 0 && $countRow == 0){
      $message = "No update has been made";
    }
    else{
      $message = "Please contact Admin.";
    }      
    return array($dataStatus, $message);
  }

  public function getCameraDetailsPlantId($plantId) {
    $builder =  $this->db->query("CALL `spSelCameraDetailsByPlantId`('$plantId')");
    return  $builder->getResultArray();
  } 

  public function addCameraDetails($postData) { 

    $sql = "CALL spInsCameraDetails(?, ?, ?, ?, ?, ?, ?)";   
    $builder = $this->db->query($sql, [$postData->masterPlantId, $postData->cameraName, $postData->apiUrl, $postData->username, $postData->password, $postData->isPrint, $postData->userInfoId]);
    
    $queryResult = $builder->getResultArray();
		$lastInsertId = (int)$queryResult[0]['lastInsertId'];
    $getExistCount = (int)$queryResult[0]['getExistCount'];

		if($lastInsertId > 0 && $getExistCount == 0){
			$dataStatus = true;
			$message = "Camera Details Added";
		}elseif($lastInsertId == 0 && $getExistCount > 0){
			$message = "Camera Details Already Added";
		}else{
			$message = "Please contact Admin.";
		}
		
		return array($dataStatus, $message);
  }

  
  public function updateCameraDetails($postData) {  
		$dataStatus = false;
		$data = $message = null;
		
		$sql = "CALL spUpdCameraDetails(?, ?, ?, ?, ?, ?, ?, ?, ?)";		
		$builder = $this->db->query($sql, [$postData->cctvCameraId, $postData->masterPlantId, $postData->cameraName, $postData->apiUrl,  $postData->username, $postData->password,$postData->isActive, $postData->isPrint, $postData->userInfoId]);
		
		$queryResult = $builder->getResultArray();
		$dataCount= (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

		if($dataCount > 0 &&  $countRow > 0 ){
			$dataStatus = true;
			$message = "Camera Details Updated";
		}
		elseif($dataCount > 0 &&  $countRow == 0){
			$message = "No update has been made";
		}
		else{
			$message = "Please contact Admin.";
		}
		
		return array($dataStatus, $message);
  } 

  public function addColorToken($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spInsColorOrToken(?, ?)";		
    $builder = $this->db->query($sql, [ $postData->colorToken,  $postData->userInfoId]);
    
    $queryResult = $builder->getResultArray();
		$getExistCount= (int)$queryResult[0]['getExistCount'];
    $lastInsertId = (int)$queryResult[0]['lastInsertId'];

		if($getExistCount == 0 &&  $lastInsertId > 0 ){
			$dataStatus = true;
			$message = "Color Token Added";
		}
		else if($getExistCount > 0 &&  $lastInsertId == 0){
			$message = "Color Token Already Added";
		}
		else{
			$message = "Please contact Admin.";
		}
		
		return array($dataStatus, $message);
  } 

  public function updateColorToken($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spUpdColorOrToken(?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->masterColorTokenId, $postData->colorToken,  $postData->isActive, $postData->userInfoId]);
    
    $queryResult = $builder->getResultArray();
    $dataCount= (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 &&  $countRow > 0 ){
      $dataStatus = true;
      $message = "Color Token Updated";
    }
    elseif($dataCount > 0 &&  $countRow == 0){
      $message = "No update has been made";
    }
    else{
      $message = "Please contact Admin.";
    }
    
    return array($dataStatus, $message);
  }
  
  public function getMasterGate () {
    $builder =  $this->db->query("CALL `spSelMasterGate`()");
    return  $builder->getResultArray();
  } 


  public function addMasterGate($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spInsMasterGate(?, ?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->gateName, $postData->OwnWB, $postData->isMovement, $postData->userInfoId,$postData->isConfirm]);

    $queryResult = $builder->getResultArray();
    $data= (int)$queryResult[0]['lastInsertId'];
    $countRow = (int)$queryResult[0]['countRow'];
    $getExitCount = (int)$queryResult[0]['getExitCount'];

    if($data > 0 &&  $countRow > 0 && $getExitCount == 0 ){
      $dataStatus = true;
      $message = "Master Gate Updated";
    }
    elseif($data == 0 && $countRow == 0 && $getExitCount > 0){
      $message = "Master Gate Already Added";
    }
    else{
      $message = "Please contact Admin.";
    }
    
    return array($dataStatus, $message, $data);
  }

  public function updateMasterGate($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spUpdMasterGate(?, ?, ?, ?, ?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->masterGateId, $postData->gateName, $postData->OwnWB, $postData->isMovement, $postData->isActive, $postData->userInfoId,$postData->workingProcess,$postData->confirmationStatus]);
    
    $queryResult = $builder->getResultArray();
    $dataCount= (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    // print_r($queryResult);return;

    if($dataCount > 0 &&  $countRow > 0 ){
      $dataStatus = true;
      $message = "Master Gate Updated";
    }
    elseif($dataCount > 0 &&  $countRow == 0){
      $message = "No update has been made";
    }
    else{
      $message = "Please contact Admin.";
    }
    
    return array($dataStatus, $message);
  }

  public function addCashInfo($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spGenerateCashNumber(?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->userInfoId, $postData->moduleTypeId, 'cash']);
    $getCashNumberResult = $builder->getResultArray();
    $getCashNumber = $getCashNumberResult[0]['cashNumber'];
    
    $sql = "CALL spInsCashInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->loadingAndUnloadingInfoId, $postData->moduleTypeId, $getCashNumber, $postData->personName, $postData->phoneNo, $postData->remarks, $postData->masterPlantId, $postData->invoiceNo, $postData->invoiceCopy, $postData->userInfoId,$postData->invoiceAmount]);
    
    $queryResult = $builder->getResultArray();
    $lastInsertId = (int)$queryResult[0]['lastInsertId'];

    if($lastInsertId > 0 ){
      $dataStatus = true;
      $message = "Cash Info Added";
    }        
    else{
      $message = "Please contact Admin.";
    }
    
    return array($dataStatus, $message);
  }

  // Add FG Sales Return Info
  public function addFgSalesReturnInfo($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spInsFgSalesReturnInfo(?, ?, ?, ?, ?, ?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->moduleTypeId, $postData->returnRefNo, $postData->vehicleNo, $postData->masterPlantId, $postData->driverMobileNumber, $postData->returnReasonId, $postData->remarks, $postData->userInfoId,$postData->gatePassDocument]);
    
    $queryResult = $builder->getResultArray();
    $data = (int)$queryResult[0]['lastInsertId'];

    if($data > 0 ){
      $dataStatus = true;
      $message = "Return Info Added";
    }      
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message, $data);
  }

  public function addFgReturnQuantityDetails($postData){   

    foreach($postData->quantityDetails as $resultRow){
          $runQuery.= "('.$postData->fgSalesReturnInfoId.', '.$postData->gateInOutInfoId.', '".$resultRow->invoiceNo."', '".$resultRow->billingDate."', '".$resultRow->customerName."', '".$resultRow->material."', '".$resultRow->description."', '.$resultRow->quantity.', '.$resultRow->returnQuantity.', '.$resultRow->totalReturnQuantity.', '".$resultRow->uom."'),";
    } 
    $sql = "INSERT INTO fg_return_quantity_details(fgSalesReturnInfoId,gateInOutInfoId,invoiceNo, billingDate, customerName, material, description, quantity, returnQuantity, totalReturnQuantity,uom) VALUES ".rtrim($runQuery, ",").""; 

    $query2 = $this->db->query($sql);
    
    return  $query2->getResultArray();
  }

  // Get FG Sales Return Info
 // public function getFgSalesReturnInfo($vehicleNo = null, $userInfoId=null, $fgSalesReturnInfoId = null) { 
//		$builder = $this->db->query("CALL spSelFgSalesReturnInfo('$vehicleNo', '$fgSalesReturnInfoId', '$userInfoId')");	
				//print_r($builder);exit;	
//		$result = $builder->getResultArray();
//		return  $result;
//	  }
public function getFgSalesReturnInfo($vehicleNo = null, $fgSalesReturnInfoId = null, $userInfoId=null) {  
    $builder = $this->db->query("CALL spSelFgSalesReturnInfo('$vehicleNo', '$fgSalesReturnInfoId', '$userInfoId')");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Get FG Sales Return Quantity Details
  public function getFgSalesReturnQuantityDetails($fgSalesReturnInfoId, $gateInOutInfoId=null) {  
    $builder = $this->db->query("CALL spSelFgSalesReturnQuantityDetails('$fgSalesReturnInfoId', '$gateInOutInfoId')");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Add Loading & Unloading Info
  public function addLoadingUnloadingInfo($postData) {  
    $dataStatus = false;
    $data = $message = null;
  // print_r($postData);exit;
    $sql = "CALL spInsLoadingAndUnloading(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->movementTypeId, $postData->moduleTypeId, $postData->subModuleTypeId, $postData->truckNo, $postData->masterPlantId, $postData->eda, $postData->remarks, $postData->fromDate, $postData->toDate, $postData->personName, $postData->phoneNo, $postData->tripSheetNo, $postData->sampleMaterial, $postData->quantity, $postData->cashInvoiceNo, $postData->statusId, $postData->isWeight, $postData->userInfoId,$postData->gatePassDocument,$postData->water_rate,$postData->vehicle_rent]);
    $queryResult = $builder->getResultArray();

    $countRow = (int)$queryResult[0]['countRow'];
    $data = (int)$queryResult[0]['lastInsertId'];
    $getExistCount = (int)$queryResult[0]['getExistCount'];

    if($postData->serviceStatus == 1){
      $this->db->table('gate_in_out_info')
      ->set('loadingUnloadingInfoId', $data)
      ->where('vehicleNo', $postData->truckNo)
      ->where('loadingUnloadingInfoId is null')
      // ->where('moduleType', 12)
      ->orderBy('id', 'DESC')
      ->limit(1)
      ->update();
    }
    if($countRow > 0 && $data > 0){
      $dataStatus = true;
      $message = "Loading & Unloading Details Added";        
    }
    else if($countRow == 0 && $data > 0){
      $message = "Truck Details Already Added";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message, $data);
  }

  // Add Purchase Order Details
  public function addPurchaseOrderDetails($postData){     
    $i = 1;
    $runQuery = "";

    foreach ($postData->purchaseOrderDetails as $resultRow) {
      $fetchsql = "SELECT ID FROM master_plant WHERE WERKS = ?";
      $builder = $this->db->query($fetchsql, [$resultRow->plantCode]);
      $plantId = $builder->getResultArray();
      $masterPlantId = isset($plantId[0]['ID']) ? $plantId[0]['ID'] : 0;
      $invoiceCopy = !empty($resultRow->shipmentCopy) ? $resultRow->shipmentCopy : $resultRow->invoiceCopy;
      $serviceStatus = !empty($postData->serviceStatus) ? $postData->serviceStatus : 0;

      if (!empty($invoiceCopy)) {
        if (stripos($invoiceCopy, '.pdf') !== false) {
          $invoiceCopy = $invoiceCopy;
        } else {
          $pdfResult = PDFConvertor::image_to_pdf($invoiceCopy, 'invoice');
          $pdfResult = str_replace('/var/www/purchasepro/sapfileshare', 'https://purchasepro.nagamills.com/sapfileshare',$pdfResult['path']); 
          $invoiceCopy = isset($pdfResult) ? $pdfResult : $invoiceCopy;
        }
      }
      $sql = "CALL spInsPurchaseOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      $builder = $this->db->query(
        $sql,
        [
          $postData->loadingUnloadingInfoId,
          $postData->gateInOutInfoId,
          $resultRow->invoiceNo,
          $resultRow->poType,
          $resultRow->poNumber,
          $resultRow->vendorName,
          $resultRow->documentDate,
          $resultRow->vendorCode,
          $resultRow->invoiceDate,
          $invoiceCopy,
          $serviceStatus,
        ]
      );
      $queryResult = $builder->getResultArray();
      $getPurchaseOrderId = isset($queryResult[0]['getPurchaseOrderId']) ? (int)$queryResult[0]['getPurchaseOrderId'] : 0;
      $resultRow->line = $i;

      $runQuery .= "('".
        addslashes($getPurchaseOrderId)."', '".
        addslashes($resultRow->line)."', '".
        addslashes($resultRow->material)."', '".
        addslashes($resultRow->description)."', '".
        addslashes($resultRow->storageLocation)."', '".
        addslashes($masterPlantId)."', '".
        addslashes($resultRow->quantity)."', NOW(), '".
        addslashes($resultRow->poRate)."', '".
        addslashes($resultRow->freightAmount)."', '".
        addslashes($resultRow->INV_Rate)."', '".
        addslashes($resultRow->INV_BAG)."', '".
        addslashes($resultRow->ORD_QTY)."', '".
        addslashes($resultRow->InvoiceCost)."', '".
        addslashes($resultRow->TotalCost)."', '".
        addslashes($resultRow->BAG_RATE)."'),";
      $i++;
    }

    if (empty($runQuery)) {
      return false;
    }

    $sql =
      "INSERT INTO purchase_order_details(purchaseOrderId, line, material, description, storageLocation, masterPlantId, quantity, dateStamp, poRate, freightAmount, invoiceRate, invoiceQty, invoiceQtyKg, invoiceCost, totalCost, BAG_RATE) VALUES " .
      rtrim($runQuery, ",");
    $query2 = $this->db->query($sql);
    $query2 = $query2->getResultArray();

    $this->POAutoMail($postData->loadingUnloadingInfoId,$postData->purchaseOrderDetails);

   
    return  $query2;
  }

  // Update Purchase Order Details
   public function updatePurchaseOrderDetails($postData) {
    $dataStatus = false;
    $data = $message = null;
    $purchaseOrderArray = array();
    $currentDateTime=date("Y-m-d H:i:s");

    $sql = "CALL spSelPurchaseOrderDetails(?, ?)";		
		$builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId, 1]);
		$getPurchaseOrderDetails = $builder->getResultArray();
    $getLine = end($getPurchaseOrderDetails);
    $i = isset($getLine['ZZLINE']) ? $getLine['ZZLINE'] + 1 : 1;

    $sql = "CALL spSelGateInOutInfoByLoadingUnloadingId(?)";		
		$builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId]);
		$getGateInOutData = $builder->getResultArray();

    $purchaseOrderArray = $postData->purchaseOrderDetails;    

    foreach($purchaseOrderArray as $resultRow){ 
      $resultRow->line = $i;
        $poData[] = array(
          'ZZLINE' => $resultRow->line,
          'ZZPO_NO' => $resultRow->poNumber,
          'ZZREC_PLANT' => $resultRow->plantCode,
          'ZZREC_STORAGE_LOC' => $resultRow->storageLocation,
          'ZZINV_NO' => $resultRow->invoiceNo,
          'fileformat'=> $resultRow->fileformat,
          'filename'=> $resultRow->filename,
          'lv_xstring'=> $resultRow->lv_xstring,
          'zzvendor'=>$resultRow->vendorCode,
        );
      $i++;     
    }
    $arrayData = $poData;
    $duplicateArray = [];

    foreach ($arrayData as $key => $value) {
        $poInvoiceKey = $value['ZZPO_NO'] . '-' . $value['ZZINV_NO'];
        if (in_array($poInvoiceKey, $duplicateArray)) {
            unset($arrayData[$key]);
        } else {
            $duplicateArray[] = $poInvoiceKey;
        }
    }

    $lastElement = end($getPurchaseOrderDetails);
    $j = isset($lastElement['ZZLINE']) ? $lastElement['ZZLINE'] + 1 : 1;
    $finalData = [];
    foreach($arrayData as $resultRow){ 
      $resultRow['ZZLINE'] = $j;
      $finalData[] = array(
        'ZZLINE' => $resultRow['ZZLINE'],
        'ZZPO_NO' => $resultRow['ZZPO_NO'],
        'ZZREC_PLANT' => $resultRow['ZZREC_PLANT'],
        'ZZREC_STORAGE_LOC' => $resultRow['ZZREC_STORAGE_LOC'],
        'ZZINV_NO' => $resultRow['ZZINV_NO'],
        'fileformat'=> $resultRow['fileformat'],
        'filename'=> $resultRow['filename'],
        'lv_xstring'=> $resultRow['lv_xstring'],
        'zzvendor'=>$resultRow['zzvendor'],
      );
      $j++;
    }
    $runQuery = "";
    if(count($purchaseOrderArray) > 0  && $getGateInOutData != '' ){ 
        // if (empty($runQuery)) {
        //   return false;
        // }
    // print_r($purchaseOrderArray);exit;

      if(($getGateInOutData[0]['moduleTypeId'] == 15 || $getGateInOutData[0]['moduleTypeId'] == 21 || $getGateInOutData[0]['moduleTypeId'] == 12 || $getGateInOutData[0]['moduleTypeId'] == 33 || $getGateInOutData[0]['moduleTypeId'] == 34 || $getGateInOutData[0]['moduleTypeId'] == 25 || $getGateInOutData[0]['moduleTypeId'] == 16 || ($getGateInOutData[0]['moduleTypeId'] == 38 && $getGateInOutData[0]['moduleStatusId'] > 4))){

        $urlPath ="zgatepro/zgp_pochange/po_changes?sap-client=900";

        $sap_data = array (
          "ZZVA_NO" => $getGateInOutData[0]['vaNumber'],
          "ZZTRUCK_NO" => $getGateInOutData[0]['vehicleNo'],
          "ZZPLANT" => $getGateInOutData[0]['werks'],
          "ZZTRANSACTION_TYPE" => $getGateInOutData[0]['moduleType'],
          "ZZLOADING_WGT" => $getGateInOutData[0]['firstWeight'],
          "ZZEMPTY_WGT" => $getGateInOutData[0]['secondWeight'],
          "ZZNET_WEIGHT" => $getGateInOutData[0]['netWeight'],
          "ZZGATEIN_TIME" => $getGateInOutData[0]['gateInDateStamp'],
          "ZZGATEOUT_TIME" => $getGateInOutData[0]['gateOutDateStamp'],
          // "METHOD" => "PUT",
          "ZZLINE" => $finalData
        );
        // print_r($sap_data);exit;
        $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));

        if(($res[0]->STATUS) > 0){

          foreach($purchaseOrderArray as $resultRow){ 
            

            $fetchsql = "SELECT ID FROM master_plant WHERE WERKS = '$resultRow->plantCode';";
            $builder =  $this->db->query($fetchsql);
            $plantId = $builder->getResultArray();
            $masterPlantId = $plantId[0]['ID'];	
            $invoiceCopy = $resultRow->shipmentCopy ? $resultRow->shipmentCopy : $resultRow->invoiceCopy;
            $serviceStatus = $postData->serviceStatus ? $postData->serviceStatus : 0;
            $sql = "CALL spInsPurchaseOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
            $builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId, $postData->gateInOutInfoId, $resultRow->invoiceNo, $resultRow->poType, $resultRow->poNumber, $resultRow->vendorName, $resultRow->documentDate, $resultRow->vendorCode,$resultRow->invoiceDate,$invoiceCopy,$serviceStatus]);
            $queryResult = $builder->getResultArray();
            $getPurchaseOrderId = (int)$queryResult[0]['getPurchaseOrderId'];
    
            $runQuery.= "('$getPurchaseOrderId', '$resultRow->line', '".$resultRow->material."', '".$resultRow->description."', '".$resultRow->storageLocation."', '$masterPlantId', '".$resultRow->quantity."', NOW()),";
          } 
          
          $sql5 = "UPDATE gate_in_out_info SET moduleStatusId = 5,waitingAt=10 WHERE id = (
            SELECT id 
            FROM gate_in_out_info
            WHERE loadingUnloadingInfoId = '$postData->loadingUnloadingInfoId'
            ORDER BY id DESC
            LIMIT 1
           )";
          $query5 = $this->db->query($sql5);

          $sql = "INSERT INTO purchase_order_details(purchaseOrderId, line, material, description, storageLocation, masterPlantId, quantity, dateStamp) VALUES ".rtrim($runQuery, ",")."";     
          $query2 = $this->db->query($sql);
        }
        else{
					$dataStatus = false;
					$message = $res[0]->MESSAGE;

					return array($dataStatus, "$message, Please Contact SAP Team");
				}
      }
      else{

        foreach($purchaseOrderArray as $resultRow){ 

          $fetchsql = "SELECT ID FROM master_plant WHERE WERKS = '$resultRow->plantCode';";
          $builder =  $this->db->query($fetchsql);
          $plantId = $builder->getResultArray();
          $masterPlantId = $plantId[0]['ID'];	

          $invoiceCopy = $resultRow->shipmentCopy ? $resultRow->shipmentCopy : $resultRow->invoiceCopy;
          $serviceStatus = $postData->serviceStatus ? $postData->serviceStatus : 0;
          $sql = "CALL spInsPurchaseOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
          $builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId, $postData->gateInOutInfoId, $resultRow->invoiceNo, $resultRow->poType, $resultRow->poNumber, $resultRow->vendorName, $resultRow->documentDate, $resultRow->vendorCode, $resultRow->invoiceDate,$invoiceCopy,$serviceStatus]);
          $queryResult = $builder->getResultArray();
          $getPurchaseOrderId = (int)$queryResult[0]['getPurchaseOrderId'];

          $runQuery.= "('$getPurchaseOrderId', '$resultRow->line', '".$resultRow->material."', '".$resultRow->description."', '".$resultRow->storageLocation."', '$masterPlantId', '".$resultRow->quantity."', NOW()),";
        } 

        $sql = "INSERT INTO purchase_order_details(purchaseOrderId, line, material, description, storageLocation, masterPlantId, quantity, dateStamp) VALUES ".rtrim($runQuery, ",").""; 
        $query2 = $this->db->query($sql); 
      }
      $dataStatus = true;
      $message = "Purchase Order Details Added";
    }
    else{

      $message = "Purchase Order Details not Added";
    }    
    return array($dataStatus, $message);
  }

  // Add RM Water Details
  public function addRmWaterDetails($postData) {  
    $dataStatus = false;
    $data = $message = null;
    $gateInOutInfoIdArray = array(); 
    $currentDateTime = date("Y-m-d H:i:s");  

    $builder = $this->db->query("CALL spSelPurchaseOrder('$postData->loadingUnloadingInfoId',0)");	
    $getPurchaseOrderData = $builder->getResultArray();
    
    $urlPath ="zgatepro/zrm_water/rmwater?sap-client=900";
				
    $sap_data = array (
      "po_no" => $getPurchaseOrderData[0]['poNumber'],
      "po_line_item" => $getPurchaseOrderData[0]['line'],
      "va_no" => $postData->vaNumber,
      "truck_no" => $postData->vehicleNo,
      "material" => $getPurchaseOrderData[0]['material'],
      "plant" => $getPurchaseOrderData[0]['plantName'],
      "storage_location" => $getPurchaseOrderData[0]['storageLocation'],
      "quantity" => $postData->totalNetWeight,
     // "uom" => $getPurchaseOrderData[0]['plantName'] == '9201' ? 'L' : 'KG',
      "uom"=>'L',
      "supplier_code" => $getPurchaseOrderData[0]['vendorCode'],
      "bill_no" => $postData->vendorInvoiceNo,
      "bill_date"=>$postData->invoiceDate,
    );
 
    $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));

    if(($res[0]->STATUS) > 0 && $res[0]->MIGO_NO != ''){
      $gateInOutInfoIdArray = $postData->gateInOutInfoId;

      $builder = $this->db->query("SELECT COUNT(*) as getExistCount FROM rm_water_details WHERE vendorName = '".$postData->vendorName."' AND vendorInvoiceNo = '".$postData->vendorInvoiceNo."'");
      $queryResult =  $builder->getResultArray();
      $getExistCount = (int)$queryResult[0]['getExistCount'];

      if($getExistCount == 0){
        if(count($gateInOutInfoIdArray) > 0){

          foreach($gateInOutInfoIdArray as $dataValue){
            $getValues.="(".$dataValue.", ".$postData->totalRowCount.", '".$postData->vendorName."', '".$postData->totalNetWeight."', '".$postData->vendorInvoiceNo."', '".$postData->invoiceDate."', '".$res[0]->MIGO_NO."', '".$currentDateTime."', '".$postData->remarks."', ".$postData->userInfoId.", NOW()),"; 
          }

          $insertQuery = "INSERT INTO rm_water_details(gateInOutInfoId, totalRowCount, vendorName, totalNetWeight, vendorInvoiceNo, invoiceDate, migoNumber, migoDate, remarks, createdBy, dateStamp) VALUES ".rtrim($getValues, ",")."";
          $builder = $this->db->query($insertQuery);
          $queryResult = $builder->getResultArray();

          $dataStatus = true;
          $message = "Rm Water Details Added";
        }
        else{
          $message = "Please contact Admin.";
        }
      }
      else{
        $message = "Invoice Already Exist for the Vendor";
      }
    }
    else if(($res[0]->STATUS) == 0){
      $dataStatus = false;
      $message = $res[0]->MESSAGE;

      return array($dataStatus, "$message, Please Contact SAP Team");
    }

    return array($dataStatus, $message, $data);
  }

   // Update RM Water Details
  public function updateRmWaterDetails($postData) { 
    $sql = "CALL updRmWaterDetails(?, ?)";
    $builder = $this->db->query($sql, [$postData->gateInOutInfoId, $postData->userInfoId]);
  }

  // Update Loading & Unloading Info
  public function updateLoadingUnloadingInfo($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spUpdLoadingUnloadingInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId, $postData->truckNo, $postData->masterPlantId, $postData->eda, $postData->remarks, $postData->fromDate, $postData->toDate, $postData->personName, $postData->phoneNo, $postData->tripSheetNo, $postData->isWeight, $postData->statusId, $postData->userInfoId]);

    $queryResult = $builder->getResultArray();

    $dataCount = (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 && $countRow > 0){
      $dataStatus = true;
      $message = "Loading & Unloading Details Updated";        
    }
    else if($dataCount > 0 && $countRow == 0){
      $message = "No update has been made";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

  // Get Purchase Order
  public function getPurchaseOrder($loadingUnloadingInfoId, $gateInOutInfoId=null) {  
    $builder = $this->db->query("CALL spSelPurchaseOrder('$loadingUnloadingInfoId', '$gateInOutInfoId')");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  public function getCashInfo($cashInfoId) {  
    $builder = $this->db->query("CALL spSelCashInfo('$cashInfoId')");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Get User PlantId
  public function getUserPlant($userInfoId) { 
    $builder = $this->db->query("CALL spSelUserPlantId('$userInfoId')");
    $result = $builder->getResultArray();
    return $result;
  }

  public function addUserModuleAccess($postData) {  
    $dataStatus = false;
    $data = $message = null;
    $moduleTypeIdArray = $postData->moduleTypeId ?? [];

    if (count($moduleTypeIdArray) > 0) {
        $getValues = "";

        foreach ($moduleTypeIdArray as $dataValue) {

            // ✅ Step 1: Check for duplicate
            $dupCheck = $this->db->table("user_module_access")
                ->select("id")
                ->where("userInfoId", $postData->userInfoId)
                ->where("moduleTypeId", $dataValue)
                ->where("isAccess", 1)
                ->get()
                ->getRow();

            if ($dupCheck) {
                // ❌ Duplicate found, skip this module
                continue;
            }

            // ✅ Step 2: Determine iFoodSales flag
            $isIFoodSales = ($dataValue == 1 && $postData->isIFoodSales == 1) ? 1 : 0;

            // ✅ Step 3: Build insert values
            $getValues .= "(" . $postData->userInfoId . ", " . $dataValue . ", 1, " . $isIFoodSales . ", NOW()),";
        }

        // ✅ Step 4: Insert only if we have non-duplicate entries
        if (!empty($getValues)) {
            $insertQuery = "INSERT INTO user_module_access (userInfoId, moduleTypeId, isAccess, isIFoodSales, dateStamp) VALUES " . rtrim($getValues, ",");
            $builder = $this->db->query($insertQuery);
            $dataStatus = true;
            $message = "User Module Access Added Successfully (duplicates skipped)";
        } else {
            $message = "All selected modules already exist for this user.";
        }
    } else {
        $message = "No module selected or User Info not found.";
    }

    return [$dataStatus, $message, $data];
}


  public function updateUserGate($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spUpdUserGate(?, ?)";		
    $builder = $this->db->query($sql, [$postData->userInfoId, $postData->masterGateId]);

    $queryResult = $builder->getResultArray();

    $dataCount = (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 && $countRow > 0){
      $dataStatus = true;
      $message = "User Gate Updated";        
    }
    else if($dataCount > 0 && $countRow == 0){
      $message = "No update has been made";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

    public function getUserModuleAccess($userInfoId = null) {  
    $builder = $this->db->query("CALL spSelUserModuleAccess('$userInfoId')");	
    $result = $builder->getResultArray();	
    return  $result;
  }
    
  // Get User Gate Info
  public function getUserGateInfo() {  
    $builder = $this->db->query("CALL spSelUserGateInfo()");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Check Master Plant
  public function checkMasterPlant($werks) {  
    $builder = $this->db->query("CALL spCheckMasterPlant('$werks')");	
    $result = $builder->getResultArray();	
    return  $result;
  } 

  // Get Po Type
  public function getPoType($poType = null) {  
    $builder = $this->db->query("CALL spSelPoType('$poType')");	
    $result = $builder->getResultArray();	
    return  $result;
  } 

  // Get Po Type
  public function getMasterPlant() {  
    $builder = $this->db->query("CALL spSelMasterPlant()");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Add Gate In Out History
  public function addGateInOutHistory($gateInOutInfoId, $moduleStatusId, $remarks, $userInfoId) {      
  
    $sql = "CALL spInsGateInOutHistory(?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$gateInOutInfoId, $moduleStatusId, $remarks, $userInfoId]);
    $queryResult = $builder->getResultArray();      
  }

  public function getPoTypeDetails() {  
    $builder = $this->db->query("CALL spSelPoTypeDetails()");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  public function addPoTypeDetails($postData) {  
    $dataStatus = false;
    $data = $message = null;
    // print_r($postData);exit;
    $sql = "CALL spInsPoTypeDetails(?, ?, ?, ?, ?, ?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->moduleTypeId, $postData->type, $postData->name, $postData->isWeight, $postData->userInfoId,$postData->isPurchase,$postData->isReceipt,$postData->invoiceQty,$postData->batchCode]);

    $queryResult = $builder->getResultArray();

    $lastInsertId = (int)$queryResult[0]['lastInsertId'];
    $getExistCount = (int)$queryResult[0]['getExistCount'];

    if($getExistCount == 0 && $lastInsertId > 0){
      $dataStatus = true;
      $message = "Po Type Added";        
    }else if($getExistCount > 0 && $lastInsertId == 0){
      $message = "Po Type Already Added";
    }else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

  public function updatePoTypeDetails($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spUpdPoTypeDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->poTypeId, $postData->moduleTypeId, $postData->type, $postData->name, $postData->isWeight, $postData->isActive, $postData->userInfoId,$postData->isPurchase,$postData->isReceipt,$postData->invoiceQty,$postData->batchCode]);

    $queryResult = $builder->getResultArray();

    $dataCount = (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 && $countRow > 0){
      $dataStatus = true;
      $message = "Po Type Details Updated";        
    }
    else if($dataCount > 0 && $countRow == 0){
      $message = "No update has been made";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

  // Get Vendor Details
	public function getVendorDetails($fromDate, $toDate, $userInfoId) { 
    $fromDateMilliSecond = $fromDate / 1000;
    $toDateMilliSecond = $toDate / 1000;
    $fromDate = date("Y-m-d", $fromDateMilliSecond);
    $toDate = date("Y-m-d", $toDateMilliSecond);
    $sql = "CALL spSelVendorDetails(?, ?, ?)";
    $builder = $this->db->query($sql, [$fromDate, $toDate, $userInfoId]);	
    $result = $builder->getResultArray();
    return $result;
  }

  // Get Sub Module Type
  public function getSubModuleType($moduleTypeId) {  
    $builder = $this->db->query("CALL spSelSubModuleType('$moduleTypeId')");	
    $result = $builder->getResultArray();	
    return  $result;
  }
  
  public function VehicleAlreadyInCheck($Vehicle_no){
		$builder = $this->db->table("gate_in_out_info");
		$builder = $builder->select("master_plant.PLANT_NAME,master_plant.WERKS,gate_in_out_info.id");
    $builder = $builder->join('master_plant', 'gate_in_out_info.masterPlantId = master_plant.ID', 'inner');
		$builder =  $builder->where("gate_in_out_info.waitingAt NOT IN(7,8,10,13,11,15,16,17) and gate_in_out_info.vehicleNo = '$Vehicle_no' and moduleType NOT IN(12,15,21,16,25,33,34,35,29,37,44)");
		return  $builder->distinct()->get()->getResultArray();
  }
  
  // Get Meeting Type
  public function getMeetingType() {  
    $builder = $this->db->query("CALL spSelMeetingType()");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  
  // Get Key Details
  public function getKeyDetails() {  
    $builder = $this->db->query("CALL spSelKeyDetails()");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Get Employee Details
  public function getEmployeeDetails($userInfoId) {  
    $builder = $this->db->query("CALL spSelEmployeeDetails('$userInfoId')");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Add Key Collection Details
	public function addKeyCollectionDetails($postData, $otp) { 
    // print_r($postData);
    // print_r($otp);
    // exit;
		$dataStatus = false;
		$data = $message = null;

    $sql1 = "CALL spGenerateCashNumber(?, ?, ?)";		
    $builder1 = $this->db->query($sql1, [$postData->userInfoId, '', 'key']);
    $getHandCarryNumberResult = $builder1->getResultArray();
    $getVaNumber = $getHandCarryNumberResult[0]['cashNumber'];
		
		$sql = "CALL spInsKeyCollectionDetails(?, ?, ?, ?, ?, ?, ?, ?)";		
		$builder = $this->db->query($sql, [$postData->keyCollectionDetailsId, $getVaNumber, $postData->keyDetailsId, $postData->receiverId, $postData->giverId, $postData->userInfoId, $otp,$postData->mobileNo]);
	
		$queryResult = $builder->getResultArray();	
    $countRow = (int)$queryResult[0]['countRow'];
		$dataCount = (int)$queryResult[0]['dataCount'];
		$lastInsertId = (int)$queryResult[0]['lastInsertId'];		
	
		if($countRow > 0 && $dataCount == 0 &&  $lastInsertId > 0){
		  $dataStatus = true;
		  $message = "Key Distributed Successfully";        
		}
    else if($postData->keyCollectionDetailsId == 0 && $countRow == 0 && $dataCount == 1 &&  $lastInsertId == 0){
		  $message = "Key Distribution Already Added";        
		}
		else if($countRow > 0 && $dataCount > 0 && $lastInsertId == 0){
      $dataStatus = true;
		  $message = "Key Collected Successfully";
		}
		else{
		  $message = "Please contact Admin.";
		}
		return array($dataStatus, $message,$lastInsertId);
	}

  // Get Key Collection Details
  public function getKeyCollectionDetails($userInfoId) {  
    $builder = $this->db->query("CALL spSelKeyCollectionDetails('$userInfoId')");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Get Key Collection Details
  public function getWorkNature() {  
    $builder = $this->db->query("CALL spSelWorkNature()");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Get Key Collection Details
  public function getShift() {  
    $builder = $this->db->query("CALL spSelShift()");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Get Definitions
  public function getDefinitions($isMaster=null) {  
    $builder = $this->db->query("CALL spSelDefinitions('$isMaster')");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Get Definitions List
  public function getDefinitionsList($definitionsId, $isMaster=null) {  
    $builder = $this->db->query("CALL spSelDefinitionsList('$definitionsId', '$isMaster')");	
    $result = $builder->getResultArray();	
    return  $result;
  }

  // Add Definitions Details
  public function addDefinitions($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spInsDefinitions(?, ?)";		
    $builder = $this->db->query($sql, [$postData->definitions, $postData->userInfoId]);

    $queryResult = $builder->getResultArray();
    $countRow = (int)$queryResult[0]['countRow'];
    $getExistCount = (int)$queryResult[0]['getExistCount'];
    $lastInsertId = (int)$queryResult[0]['lastInsertId'];		

    if($getExistCount == 0 && $lastInsertId > 0){
      $dataStatus = true;
      $message = "Definitions Added";             
    }
    else if($getExistCount > 0 && $lastInsertId == 0){
      $message = "Definitions Already Added";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

  // Add Definitions Details
  public function addDefinitionsDetails($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spInsDefinitionsDetails(?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->definitionsId, $postData->definitionsName, $postData->userInfoId]);

    $queryResult = $builder->getResultArray();
    $countRow = (int)$queryResult[0]['countRow'];
		$getExistCount = (int)$queryResult[0]['getExistCount'];
		$lastInsertId = (int)$queryResult[0]['lastInsertId'];		

    if($getExistCount == 0 && $lastInsertId > 0){
      $dataStatus = true;
		  $message = "Definitions Details Added";             
    }
    else if($getExistCount > 0 && $lastInsertId == 0){
      $message = "Definitions Details Already Added";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

  // Update Definitions
  public function updateDefinitions($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spUpdDefinitions(?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->definitionsId, $postData->definitions, $postData->isActive, $postData->userInfoId]);

    $queryResult = $builder->getResultArray();
    $dataCount = (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 && $countRow > 0){
      $dataStatus = true;
      $message = "Definitions Updated";        
    }
    else if($dataCount > 0 && $countRow == 0){
      $message = "No update has been made";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

  // Update Definitions Details
  public function updateDefinitionsDetails($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spUpdDefinitionsDetails(?, ?, ?, ?, ?, ?)";		
    $builder = $this->db->query($sql, [$postData->definitionsListId, $postData->definitionsId, $postData->definitionsName, $postData->isActive, $postData->userInfoId,$postData->definitionsValue]);

    $queryResult = $builder->getResultArray();
    $dataCount = (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 && $countRow > 0){
      $dataStatus = true;
      $message = "Definition Details Updated";        
    }
    else if($dataCount > 0 && $countRow == 0){
      $message = "No update has been made";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

  // Delete Purchase Order
  public function deletePurchaseOrderDetails($postData) {
    $dataStatus = false;
    $data = $message = null;

    $Sql = "SELECT loadingUnloadingInfoId, poNumber FROM purchase_order  WHERE id = '$postData->purchaseOrderId'";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    $loadingUnloadingInfoId = $result[0]['loadingUnloadingInfoId'];
    $poNumber = $result[0]['poNumber'];

    $sql = "CALL spSelGateInOutInfoByLoadingUnloadingId(?)";		
		$builder = $this->db->query($sql, [$loadingUnloadingInfoId]);
		$getGateInOutData = $builder->getResultArray();

    if($getGateInOutData[0]['moduleTypeId'] == 12 || $getGateInOutData[0]['moduleTypeId'] == 15 || $getGateInOutData[0]['moduleTypeId'] == 21 || $getGateInOutData[0]['moduleTypeId'] == 33 || $getGateInOutData[0]['moduleTypeId'] == 34 || $getGateInOutData[0]['moduleTypeId'] == 38){

      $urlPath ="zgatepro/zgp_pochange/po_changes?sap-client=900";

      $sap_data = array (
        "zzva_no" => $getGateInOutData[0]['vaNumber'],
        "zztruck_no" => $getGateInOutData[0]['vehicleNo'],
        "zzpo_no" => $poNumber,
        "ZZLINE"=> $postData->line,     
        "METHOD" => "PUT"
      );

      $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));

      if(($res[0]->STATUS) > 0){
        $sql = "CALL spDelPurchaseOrder(?, ?)";		
        $builder = $this->db->query($sql, [$postData->purchaseOrderId, $postData->userInfoId]);
        $queryResult = $builder->getResultArray();
      }
      else{
        $dataStatus = false;
        $message = $res[0]->MESSAGE;
        return array($dataStatus, "$message, Please Contact SAP Team");
      }
    }
    else{
      $sql = "CALL spDelPurchaseOrder(?, ?)";		
      $builder = $this->db->query($sql, [$postData->purchaseOrderId, $postData->userInfoId]);
      $queryResult = $builder->getResultArray();
    }
    
    $dataCount = (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 && $countRow > 0){
      $dataStatus = true;
      $message = "Purchase Order Deleted";        
    }
    else if($dataCount == 0 && $countRow == 0){
      $message = "No data found";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

  // Get Return Delivery Details
  public function getReturnDeliveryDetails($gateInOutInfoId) {  
    $builder = $this->db->query("CALL spSelReturnDeliveryDetails('$gateInOutInfoId')");	
    $result = $builder->getResultArray();	
    return  $result;
  }

   // Get PoType Access
  public function getPoTypeAccess($userInfoId, $isDropdown=null) { 
    $builder = $this->db->query("CALL spSelPoTypeAccess('$userInfoId', '$isDropdown')");  
    $result = $builder->getResultArray();	
    return  $result;
  }

  public function addPoTypeAccess($postData)
  {
      $dataStatus = false;
      $data = $message = null;

      // Ensure poTypeId is an array
      $poTypeIdArray = isset($postData->poTypeId) ? (array)$postData->poTypeId : [];

      if (count($poTypeIdArray) > 0) {

          // Prepare array for new inserts
          $insertValues = "";

          foreach ($poTypeIdArray as $poTypeId) {

              // Check for duplicates
              $checkQuery = $this->db->query("
                  SELECT COUNT(*) AS cnt 
                  FROM po_type_access 
                  WHERE userInfoId = ? 
                    AND poTypeId = ?
              ", [$postData->userId, $poTypeId]);

              $row = $checkQuery->getRow();
              if ($row->cnt == 0) {
                  // Only add if not duplicate
                  $insertValues .= "(" . 
                      $this->db->escape($postData->userId) . ", " . 
                      $this->db->escape($poTypeId) . ", 1, " . 
                      $this->db->escape($postData->userInfoId) . ", NOW()),";
              }
          }

          if ($insertValues != "") {
              // Execute final insert
              $insertQuery = "
                  INSERT INTO po_type_access
                  (userInfoId, poTypeId, isAccess, createdBy, dateStamp)
                  VALUES " . rtrim($insertValues, ",");
              $this->db->query($insertQuery);

              $dataStatus = true;
              $message = "PO Type(s) assigned successfully.";
          } else {
              $message = "All selected PO Types are already assigned.";
          }
      } else {
          $message = "No PO Type found.";
      }

      return [$dataStatus, $message, $data];
  }


  // Delete FG Sales Return Info
  public function deleteFgSalesReturnInfo($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spDelFgSalesReturnInfo(?,?)";		
    $builder = $this->db->query($sql, [$postData->fgSalesReturnInfoId, $postData->userInfoId]);
    $queryResult = $builder->getResultArray();

    $countRow = (int)$queryResult[0]['countRow'];
    $dataCount = (int)$queryResult[0]['dataCount'];

    if($countRow > 0 && $dataCount > 0){
      $dataStatus = true;
      $message = "Return Info Deleted";        
    }
    else if($countRow == 0 && $data == 0){
      $message = "Return Info not found";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message, $data);
  }
  // Delete Invoice Details
  public function deleteInvoiceDetails($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spDelInvoiceDetails(?, ?)";   
    $builder = $this->db->query($sql, [$postData->gateInOutInfoDetailsId, $postData->userInfoId]);    
    $queryResult = $builder->getResultArray();

    $dataCount = (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 && $countRow > 0){
      $dataStatus = true;
      $message = "Invoice Details Deleted";        
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }
  
  public function deleteInvoiceDetail($postData) {  
    $dataStatus = false;
    $currentDateTime=date("Y-m-d H:i:s");
    $builder = $this->db->table("gate_in_out_info_details");
    $builder->set(['isManual'=> $postData->status,'updated_by'=>$postData->userInfoId,'updated_at'=>$currentDateTime])
            ->where('id', $postData->gateInOutInfoDetailsId)
            ->where('invoiceNumber', $postData->invoiceNo)
            ->update();
    
    // Check if any rows were updated
    $dataCount = $this->db->affectedRows();

    if($dataCount > 0){
      $count = $this->db->table("gate_in_out_info_details")->where('gateInOutInfoId',$postData->gateInOutInfoId)->countAllResults();
      if($count == 0){
        $this->db->table('gate_in_out_info')->set(['moduleStatusId'=>3,'waitingAt'=> 4])->where('id',$postData->gateInOutInfoId)->where('moduleStatusId !=',5)->update();
      } 
      $dataStatus = true;
      if($postData->status == 0){
        $message = "Invoice Details Deleted";
      }else{
        $message = "Invoice Details Added SAP"; 
      }      
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }
  
  // Add Employee Details
  public function addEmployeeDetails($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spInsEmployeeDetails(?, ?, ?, ?, ?, ?, ?, ?, ?)";    
    $builder = $this->db->query($sql, [$postData->employeeCode, $postData->employeeName, $postData->employeeMailId, $postData->employeeMobileNumber, $postData->employeeDepartment, $postData->employeeDesignation, $postData->employeeDivision, $postData->plantCode,  $postData->userInfoId]);

    $queryResult = $builder->getResultArray();
    $countRow = (int)$queryResult[0]['countRow'];
    $getExistCount = (int)$queryResult[0]['getExistCount'];
    $lastInsertId = (int)$queryResult[0]['lastInsertId'];   

    if($getExistCount == 0 && $lastInsertId > 0){
      $dataStatus = true;
      $message = "Employee Details Added";             
    }
    else if($getExistCount > 0 && $lastInsertId == 0){
      $message = "Employee Details Already Added";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

  // Update Employee Details
  public function updateEmployeeDetails($postData) {  
    $dataStatus = false;
    $data = $message = null;
    
    $sql = "CALL spUpdEmployeeDetails(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";   
    $builder = $this->db->query($sql, [$postData->employeeMasterId, $postData->employeeCode, $postData->employeeName, $postData->employeeMailId, $postData->employeeMobileNumber, $postData->employeeDepartment, $postData->employeeDesignation, $postData->employeeDivision, $postData->plantCode,  $postData->userInfoId]);

    $queryResult = $builder->getResultArray();
    $dataCount = (int)$queryResult[0]['dataCount'];
    $countRow = (int)$queryResult[0]['countRow'];

    if($dataCount > 0 && $countRow > 0){
      $dataStatus = true;
      $message = "Employee Details Updated";        
    }
    else if($dataCount > 0 && $countRow == 0){
      $message = "No update has been made";
    }
    else{
      $message = "Please contact Admin.";
    }
    return array($dataStatus, $message);
  }

  // Check Invoice Details
  public function checkInvoiceDetails($invoiceNo) { 
   $Sql = "SELECT COUNT(*) AS getExistCount
        FROM gate_in_out_info_details d
        JOIN gate_in_out_info g 
            ON g.id = d.gateInOutInfoId
        WHERE d.invoiceNumber = '$invoiceNo'
        AND d.isManual != 2
        AND g.moduleStatusId != 7";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }

   // Get Module Status
   public function getModuleStatus() { 
    $Sql = "SELECT id AS moduleStatusId, statusName, createdBy, createdOn, id AS value, statusName AS label FROM module_status";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }
  public function getVendorPlant($vendorCode) { 
    $Sql = "SELECT vendorCode, werks FROM vendor_plant  WHERE vendorCode = '$vendorCode'";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }

  public function QRCodeControl($user_id) { 
    $Sql = "SELECT masterGateId FROM user_info  WHERE UI_ID = '$user_id'";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }

  public function PPSetting() { 
    $Sql = "SELECT qr_control FROM pp_setting  WHERE Id = 1";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }

  public function LoadUnloadInfoDetailsById($ID) { 
    $Sql = "SELECT lui.id AS loadingAndUnloadingInfoId, lui.movementTypeId, case when lui.movementTypeId = 1 then 'LOADING' ELSE 'UNLOADING' END AS movementType,  
    lui.moduleTypeId, mm.moduleType, lui.truckNo, lui.masterPlantId, mp.PLANT_NAME AS plantName, lui.personName, 
    lui.phoneNo, lui.eda, lui.remarks, lui.fromDate, lui.toDate, lui.statusId, ps.StatusName, lui.createdBy, lui.createdOn, lui.tripSheetNo,
    lui.masterPlantId AS value, lui.cashInvoiceNo, lui.isGateIn, lui.subModuleTypeId, mp.WERKS AS werks,
    lui.isWeight, lui.isApproved, lui.sampleMaterial, lui.quantity ,sb.subModuleType FROM loading_unloading_info lui 
            LEFT JOIN master_module mm on mm.id = lui.moduleTypeId
            LEFT JOIN master_sub_module sb on sb.id = lui.subModuleTypeId
			 	    LEFT JOIN master_plant mp on mp.ID = lui.masterPlantId
			      LEFT JOIN pp_status ps on ps.Id = lui.statusId
            WHERE lui.id = '$ID'";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }

  public function SupplierVehicleInfoById($ID) { 
    $Sql = "SELECT sv.*,sd.* FROM supplier_vehical_info sv 
            LEFT JOIN supplier_dispatch_info sd on sd.SD_REFID = sv.SUPPLIER_ID
            WHERE sv.SUP_VE_REFID = '$ID'";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }

  public function updateTrailPurchaseOrderDetails($postData) {
    $dataStatus = false;
    $data = $message = null;
    $purchaseOrderArray = array();
    $currentDateTime=date("Y-m-d H:i:s");
    // print_r($postData);exit;
    $sql = "CALL spSelPurchaseOrderDetails(?, ?)";		
		$builder = $this->db->query($sql, [0, $postData->gateId]);
		$getPurchaseOrderDetails = $builder->getResultArray();
    $getLine = end($getPurchaseOrderDetails);
    $i = isset($getLine['ZZLINE']) ? $getLine['ZZLINE'] + 1 : 1;

    $sql = "CALL spSelGateInOutInfoByLoadingUnloadingId(?)";		
		$builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId]);
		$getGateInOutData = $builder->getResultArray();

    $purchaseOrderArray = $postData->purchaseOrderDetails;    
    //print_r($purchaseOrderArray);exit;

    foreach($purchaseOrderArray as $resultRow){ 
      $resultRow->line = $i;
        $poData[] = array(
          'ZZLINE' => $resultRow->line,
          'ZZPO_NO' => $resultRow->poNumber,
          'ZZREC_PLANT' => $resultRow->plantCode,
          'ZZREC_STORAGE_LOC' => $resultRow->storageLocation,
          'ZZINV_NO' => $resultRow->invoiceNo
        );
      $i++;     
    }
    $arrayData = $poData;
    $duplicateArray = array();
    foreach($arrayData as $key=>$value){
        if(!empty($duplicateArray) && in_array($value['ZZPO_NO'],$duplicateArray)) unset($arrayData[$key]);
        $duplicateArray[] = $value['ZZPO_NO'];
    }    

    $lastElement = end($getPurchaseOrderDetails);
    $j = isset($lastElement['ZZLINE']) ? $lastElement['ZZLINE']+1 : 1;
    foreach($arrayData as $resultRow){ 
      $resultRow['ZZLINE'] = $j;
      $finalData[] = array(
        'ZZLINE' => $resultRow['ZZLINE'],
        'ZZPO_NO' => $resultRow['ZZPO_NO'],
        'ZZREC_PLANT' => $resultRow['ZZREC_PLANT'],
        'ZZREC_STORAGE_LOC' => $resultRow['ZZREC_STORAGE_LOC'],
        'ZZINV_NO' => $resultRow['ZZINV_NO']
      );
      $j++;
    }
    if(count($purchaseOrderArray) > 0  && $getGateInOutData != '' ){ 

      if(($getGateInOutData[0]['moduleTypeId'] == 41)){

        $urlPath ="zgatepro/zgp_pochange/po_changes?sap-client=900";

        $sap_data = array (
          "ZZVA_NO" => $getGateInOutData[0]['vaNumber'],
          "ZZTRUCK_NO" => $getGateInOutData[0]['vehicleNo'],
          "ZZPLANT" => $getGateInOutData[0]['werks'],
          "ZZTRANSACTION_TYPE" => $getGateInOutData[0]['moduleType'],
          "ZZLOADING_WGT" => $getGateInOutData[0]['firstWeight'],
          "ZZEMPTY_WGT" => $getGateInOutData[0]['secondWeight'],
          "ZZNET_WEIGHT" => $getGateInOutData[0]['netWeight'],
          "ZZGATEIN_TIME" => $getGateInOutData[0]['gateInDateStamp'],
          "ZZGATEOUT_TIME" => $getGateInOutData[0]['gateOutDateStamp'],
          // "METHOD" => "PUT",
          "ZZLINE" => $finalData
        );
        // print_r($sap_data);exit;

        $res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));

        if(($res[0]->STATUS) > 0){

          foreach($purchaseOrderArray as $resultRow){ 
            

            $fetchsql = "SELECT ID FROM master_plant WHERE WERKS = '$resultRow->plantCode';";
            $builder =  $this->db->query($fetchsql);
            $plantId = $builder->getResultArray();
            $masterPlantId = $plantId[0]['ID'];	
            $invoiceCopy = $resultRow->shipmentCopy ? $resultRow->shipmentCopy : $resultRow->invoiceCopy;
            $serviceStatus = $postData->serviceStatus ? $postData->serviceStatus : 0;
            $sql = "CALL spInsPurchaseOrder(?, ?, ?, ?, ?, ?, ?, ?, ?)";		
            $builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId, $postData->gateId, $resultRow->invoiceNo, $resultRow->poType, $resultRow->poNumber, $resultRow->vendorName, $resultRow->documentDate, $resultRow->vendorCode, $resultRow->invoiceDate,$invoiceCopy,$serviceStatus]);
            $queryResult = $builder->getResultArray();
            $getPurchaseOrderId = (int)$queryResult[0]['getPurchaseOrderId'];
    
            $runQuery.= "('$getPurchaseOrderId', '$resultRow->line', '".$resultRow->material."', '".$resultRow->description."', '".$resultRow->storageLocation."', '$masterPlantId', '".$resultRow->quantity."', NOW()),";
          } 
          
          $sql5 = "UPDATE gate_in_out_info SET moduleStatusId = 5,waitingAt=10 WHERE loadingUnloadingInfoId = '$postData->loadingUnloadingInfoId'";
          $query5 = $this->db->query($sql5);

          $sql = "INSERT INTO purchase_order_details(purchaseOrderId, line, material, description, storageLocation, masterPlantId, quantity, dateStamp) VALUES ".rtrim($runQuery, ",")."";     
          $query2 = $this->db->query($sql);
          $dataStatus = true;
          $message = "Purchase Order Details Added";
        }
        else{
					$dataStatus = false;
					$message = $res[0]->MESSAGE;

					return array($dataStatus, "$message, Please Contact SAP Team");
				}
      }
    }
    else{

      $message = "Purchase Order Details not Added";
    }    
    return array($dataStatus, $message);
  }
  public function ActiveStatus($masterGateId) { 
    $Sql = "SELECT definitionsName FROM definitions_list  WHERE definitionsName = '$masterGateId' AND definitionsId = 18 AND isActive = 1";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }
  
  public function ActiveStatusGate($masterGateId) { 
    $Sql = "SELECT definitionsName FROM definitions_list  WHERE definitionsName = '$masterGateId' AND definitionsId = 26 AND isActive = 1";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }

  public function ActiveStatusGateOut($masterGateId) { 
    $Sql = "SELECT definitionsName FROM definitions_list  WHERE definitionsName = '$masterGateId' AND definitionsId = 27 AND isActive = 1";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }
  public function POAutoMail($load_id,$purchaseOrderDetails) { 
    $usqls = "SELECT *
    FROM gate_entry_pending_automail
    WHERE status = 1 AND type = 3
    GROUP BY id";
    $builder1 =  $this->db->query($usqls);
    $builder1 = $builder1->getResultArray();

    $purchaseOrderDetail = "SELECT pod.material,pod.description,pod.quantity,pod.material,po.poNumber,po.invoiceNo,po.vendorCode,po.vendorName
    FROM purchase_order_details pod
    JOIN purchase_order po ON po.id = pod.purchaseOrderId 
    WHERE po.loadingUnloadingInfoId = $load_id  
    GROUP BY pod.id";
    $purchaseOrderDetail =  $this->db->query($purchaseOrderDetail);
    $purchaseOrderDetail = $purchaseOrderDetail->getResultArray();

    if($builder1[0]['to_mail']){

            $to_mail = [];
            $cc_mail = [];
            $bcc_mail = [];
            $plant_id = [];
            $poType = [];
        
            $to_mail = array_merge($to_mail, explode(',', $builder1[0]['to_mail']));
            $cc_mail = array_merge($cc_mail, explode(',', $builder1[0]['cc_mail']));
            $bcc_mail = array_merge($bcc_mail, explode(',', $builder1[0]['bcc_mail']));
            $plant_id[] = $builder1[0]['plant_id'];
            $poType[] = $builder1[0]['po_type'];

            $to_mail = array_unique($to_mail);
            $cc_mail = array_unique($cc_mail);
            $bcc_mail = array_unique($bcc_mail);

        $usqls1 = "SELECT gi.vaNumber,gi.vehicleNo,gi.masterPlantId,CONCAT(pt.type, '-', pt.name) AS po_type
        FROM gate_in_out_info gi
        JOIN purchase_order po ON gi.loadingUnloadingInfoId = po.loadingUnloadingInfoId 
        JOIN po_type pt ON po.poType=pt.id
        WHERE gi.loadingUnloadingInfoId = $load_id AND gi.masterPlantId IN ($plant_id[0]) AND po.poType IN ($poType[0]) 
        GROUP BY gi.id";

        $builder2 =  $this->db->query($usqls1);
        $builder2 = $builder2->getResultArray();
        if($builder2[0]['vaNumber']){
        $subject = 'PURCHASE VEHICLE - ' . $builder2[0]['vaNumber'];
        $message = '<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                  /* Mobile Styles */
                  @media only screen and (max-width: 600px) {
                      table {
                          width: 100% !important;
                      }
                      .container {
                          width: 100% !important;
                          padding: 0 10px;
                      }
                  }
                  .container {
                      width: 100%;
                      margin: 0 auto;
                      font-family: Arial, sans-serif;
                  }
                  table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 20px 0;
                  }
                  th, td {
                      border: 1px solid #ddd;
                      padding: 8px;
                      text-align: center;
                  }
                  th {
                      background-color: #1656f7;
                      color: white;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1 style="text-align:center; color:#1656f7;">PO Details</h1>
                  <p>Dear Team,</p>
                  <p>Please find below the summary of PO inward details:</p>

                  <h2>PO Details</h2>
                  <table>
                      <thead>
                          <tr>
                              <th>VA No</th>
                              <th>PO NUMBER</th>
                              <th>PO TYPE</th>
                              <th>TRUCK NO</th>
                              <th>INVOICE NO</th>
                              <th>VENDOR CODE</th>
                              <th>VENDOR NAME</th>
                              <th>MATERIAL</th>
                              <th>ORDER QTY</th>
                          </tr>
                      </thead>
                      <tbody>';

          foreach ($purchaseOrderDetail as $row) {
              $message .= '<tr>
                  <td>' . htmlspecialchars($builder2[0]['vaNumber'], ENT_QUOTES, 'UTF-8') . '</td>
                  <td>' . htmlspecialchars($row['poNumber'], ENT_QUOTES, 'UTF-8') . '</td>
                  <td>' . htmlspecialchars($builder2[0]['po_type'], ENT_QUOTES, 'UTF-8') . '</td>
                  <td>' . htmlspecialchars($builder2[0]['vehicleNo'], ENT_QUOTES, 'UTF-8') . '</td>
                  <td>' . htmlspecialchars($row['invoiceNo'], ENT_QUOTES, 'UTF-8') . '</td>
                  <td>' . htmlspecialchars($row['vendorCode'], ENT_QUOTES, 'UTF-8') . '</td>
                  <td>' . htmlspecialchars($row['vendorName'], ENT_QUOTES, 'UTF-8') . '</td>
                  <td>' . htmlspecialchars($row['description'] ? $row['description'] : $row['material'], ENT_QUOTES, 'UTF-8') . '</td>
                  <td>' . htmlspecialchars($row['quantity'], ENT_QUOTES, 'UTF-8') . '</td>
              </tr>';
          }

          $message .= '</tbody>
                  </table>

                  <p style="font-size: 0.9em;">For contact, please reach out to the respective person.</p>
                  <br/>
                  <p style="font-size: 0.9em;">Regards,<br /> Naga Limited</p>
              </div>
          </body>
          </html>';

            $email = \Config\Services::email();
            $email->setFrom("noreply@nagamills.com", "PURCHASE VEHICLE");
            $email->setTo($to_mail);
            $email->setBcc($bcc_mail);
            $email->setCc($cc_mail);
            $email->setSubject($subject);
            $email->setMessage($message);
            $email->send();
      }
      }
  }
  public function MasterGateByID($masterGateId) { 
    $Sql = "SELECT * FROM master_gate  WHERE id = '$masterGateId' AND isActive = 1";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }
  public function getSTMQCMaster() { 
    $Sql = "SELECT * FROM master_quality_check_stm  WHERE RecStatus = 1";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }
  public function getIASQCMaster() { 
    $Sql = "SELECT * FROM master_quality_check_ias  WHERE RecStatus = 1";
    $builder = $this->db->query($Sql);	    
    $result =  $builder->getResultArray();
    return  $result;
  }
 public function VehicleAlreadyInCheckPurchase($Vehicle_no){
    $vehicle_no = trim($Vehicle_no);

    $statuses = "1,2,3,4,13,15,23,24,19,21,22";

    $sql = "
        SELECT mp.PLANT_NAME, mp.WERKS
        FROM empty_vehicle_arrival eva
        INNER JOIN master_plant mp ON mp.WERKS = eva.PLANT_ID
        WHERE eva.TRUCK_NO = '$vehicle_no'
          AND eva.VEHICLE_STATUS IN ($statuses)

        UNION

        SELECT mp.PLANT_NAME, mp.WERKS
        FROM purchase_info pi
        INNER JOIN master_plant mp ON mp.WERKS = pi.WERKS
        WHERE pi.TRUCK_NO = '$vehicle_no'
          AND pi.VECHICAL_STATUS IN ($statuses)
    ";

    return $this->db->query($sql)->getResultArray();
  }
  public function InsertBulkerdetails($postData)
  {
    $value = array(
      "bulkerNo" => $postData->bulkerNo,
      "bulkerEmptyWeight" => $postData->bulkerEmptyWeight,
      "bulkerCapacity" => $postData->bulkerCapacity,
      "createdBy" => $postData->created_by,
      "status" => 1,
    );
    $this->db->table('bulker_vehicle')->insert($value);
    $InsID = $this->insertID();   // last inserted ID
    return $InsID;
  }

  public function getBulkermasterlist()
  {
    //print_r($builder);exit;
    $builder = $this->db->table("bulker_vehicle");
    $builder = $builder->select("bulker_vehicle.*");
    return $builder->distinct()->get()->getResultArray();
  }
  public function chechbulkernumber($bulkerno)
  {
    $builder = $this->db->table("bulker_vehicle");
    $builder->where("bulker_vehicle.bulkerNo", $bulkerno);
    return $builder->countAllResults();
  }

  public function UpdateBulkerdetails($postData)
  {
    $value = array(
      "bulkerNo" => $postData->bulkerNo,
      "bulkerEmptyWeight" => $postData->bulkerEmptyWeight,
      "bulkerCapacity" => $postData->bulkerCapacity,
      "updatedBy" => $postData->updated_by,
    );
    $this->db->table('bulker_vehicle')->set($value)->where('id ', $postData->id)->update();
    return $postData->id;
  }
  public function DeleteBulkerdetails($postData)
  {
    $value = array(
      "status" => 0,
      "updatedBy" => $postData->updated_by,
    );
    $this->db->table('bulker_vehicle')->set($value)->where('id ', $postData->id)->update();
    return $postData->id;
  }
  public function RevertBulkerdetails($postData)
  {
    $value = array(
      "status" => 1,
      "updatedBy" => $postData->updated_by,
    );
    $this->db->table('bulker_vehicle')->set($value)->where('id ', $postData->id)->update();
    return $postData->id;
  }

  public function getGateKeyList()
  {
    //print_r($builder);exit;
    $builder = $this->db->table("keylistmaster");
    $builder = $builder->select("keylistmaster.*");
    return $builder->distinct()->get()->getResultArray();
  }

 public function getGateList($gateid)
{
  // print_r($gateid);exit;
    $builder = $this->db->table("master_gate");

    $builder->select("
        id AS value,
        CONCAT(gateCode, '-', gateName) AS label,
        gateCode AS GATE_CODE,
        gateName as GateName
    ");

    $builder->where("isActive", 1);

    // ✅ Handle comma-separated gate IDs
    if (!empty($gateid)) {
        $gateIds = explode(",", $gateid);   // "1,2,3" → [1,2,3]
        $builder->whereIn("id", $gateIds);
    }

    return $builder->distinct()->get()->getResultArray();
   }
   public function checkkeylist($key,$gateid)
   {
      $builder = $this->db->table("keylistmaster");
      $builder->where("keylistmaster.key_name", $key); 
      $builder->where("keylistmaster.gate_id", $gateid);
      return $builder->countAllResults();
    }
    
    public function getkeyListbyuser($gateid)
   {
      $builder = $this->db->table("keylistmaster");
      $builder->select("id as value, key_name as label"); 
      $builder->where("keylistmaster.gate_id", $gateid);
      return $builder->distinct()->get()->getResultArray();
    }
    
    public function getDataTypes()
   {
      $builder = $this->db->table("definitions_list");
      $builder->select("id as value, definitionsName as label"); 
      $builder->where("definitions_list.isActive", 1 );
      $builder->where("definitions_list.definitionsId", 31 );
      return $builder->distinct()->get()->getResultArray();
    }

    public function InsertGateKeydetails($postData)
  {
    $value = array(
      "key_name" => $postData->key_name,
      "gate_id" => $postData->gate_id,
      "gate_code" => $postData->code,
      "block_name" => $postData->block_name,
      "created_by" => $postData->created_by,
      "active_status" => 1,
    );
    $this->db->table('keylistmaster')->insert($value);
    $InsID = $this->insertID();   // last inserted ID
    return $InsID;
  }

  public function UpdateGateKeydetails($postData)
  {
    $value = array(
      "key_name" => $postData->key_name,
      "gate_id" => $postData->gate_id,
      "gate_code" => $postData->code,
      "block_name" => $postData->block_name,
      "updated_by" => $postData->updated_by,
      "updated_at" => date('Y-m-d H:i:s'),
    );
    $this->db->table('keylistmaster')->set($value)->where('id ', $postData->id)->update();
    return $postData->id;
  }

  public function DeleteGateKey($postData)
  {
    $value = array(
      "active_status" => 0,
      "deleted_by" => $postData->updated_by,
      "deleted_at" => date('Y-m-d H:i:s'),
    );
    $this->db->table('keylistmaster')->set($value)->where('id ', $postData->id)->update();
    return $postData->id;
  }
  public function RevertGateKey($postData)
  {
    $value = array(
      "active_status" => 1,
      "reverted_by" => $postData->updated_by,
      "reverted_at" => date('Y-m-d H:i:s'),
    );
    $this->db->table('keylistmaster')->set($value)->where('id ', $postData->id)->update();
    return $postData->id;
  }
//======REGISTER=======
  public function checkregisterlist($key,$gateid)
   {
      $builder = $this->db->table("register_master");
      $builder->where("register_master.register_type", $key); 
      $builder->where("register_master.plant_code", $gateid);
      return $builder->countAllResults();
    }
public function insertRegister($postData)
{
    $db = \Config\Database::connect();

    /* ================= INSERT MASTER ================= */

    $masterData = [
        "register_type" => $postData->register_name,
        "plant_code"    => $postData->plant_ids,
        "created_by"    => $postData->created_by,
        "active_status" => 1,
    ];

    $db->table('register_master')->insert($masterData);

    $registerId = $db->insertID();

    /* ================= INSERT DETAILS ================= */

    if (!empty($postData->subtypes)) {

        foreach ($postData->subtypes as $subtype) {

            // convert dropdown_options string to array
            $selectArray = null;

            if ($subtype->data_type == "SELECT" && !empty($subtype->dropdown_options)) {

                // convert comma string to array
                $selectArray = explode(",", $subtype->dropdown_options);

                // store as JSON in DB
                $selectArray = json_encode($selectArray);
            }

            $detailData = [

                "register_id"      => $registerId,
                "register_subtype" => $subtype->subtype,
                "Datatype"         => $subtype->data_type,
                "select_array"     => $selectArray,
                "created_by"       => $postData->created_by,
                "active_status"    => 1,

            ];

            $db->table('register_master_details')->insert($detailData);
        }
    }

    return $registerId;
}

public function getRegisterList()
{
    $builder = $this->db->table("register_master");

    $builder->select("
        register_master.id,
        register_master.register_type,
        register_master.plant_code,
        register_master.active_status,
        register_master.created_by,
        register_master.created_at,

        register_master_details.id as detail_id,
        register_master_details.register_subtype,
        register_master_details.Datatype,
        register_master_details.select_array
    ");

    $builder->join(
        'register_master_details',
        'register_master.id = register_master_details.register_id',
        'inner'
    );

    $builder->where("register_master.active_status", 1);
    $builder->where("register_master_details.status", 1);

    $builder->orderBy("register_master.id", "DESC");

    $results = $builder->get()->getResultArray();

    /* ================= GROUP DATA ================= */

    $grouped = [];

    foreach ($results as $row) {

        $registerId = $row['id'];

        if (!isset($grouped[$registerId])) {

            $grouped[$registerId] = [

                "id" => $row['id'],
                "register_type" => $row['register_type'],
                "plant_code" => $row['plant_code'],
                "active_status" => $row['active_status'],
                "created_by" => $row['created_by'],
                "created_at" => $row['created_at'],

                "details" => []

            ];
        }

        $grouped[$registerId]['details'][] = [

            "detail_id" => $row['detail_id'],
            "register_subtype" => $row['register_subtype'],
            "Datatype" => $row['Datatype'],

            // decode JSON select options
            "select_array" => $row['select_array']
                ? json_decode($row['select_array'], true)
                : []

        ];
    }

    return array_values($grouped);
}

 public function getkeydetailforotp($lastid)
{
    $builder = $this->db->table("key_collection_details");
    $builder->select("key_collection_details.otp,key_collection_details.mobile_number");
    $builder->where("key_collection_details.id", $lastid); 
    return $builder->get()->getResultArray();
} 
public function verifyKeyOTP($postData)
{
    $builder = $this->db->table("key_collection_details");

    // Get OTP from DB
    $builder->select("otp");
    $builder->where("id", $postData->keyCollectionDetailsId);
    $result = $builder->get()->getRowArray();

    if(!$result){
        return [false, "Invalid request"];
    }

    $dbOtp = $result['otp'];

    // Compare OTP
    if($dbOtp == $postData->otp){

        // Update verification
        $this->db->table("key_collection_details")
            ->where("id", $postData->keyCollectionDetailsId)
            ->update([
                "isVerified" => 1
            ]);

        return [true, "OTP Verified Successfully"];
    }
    else{
        return [false, "Invalid OTP"];
    }
}
}
