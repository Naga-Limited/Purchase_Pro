<?php

namespace App\Models\GatePro;

use CodeIgniter\Model;
use App\Helpers\SapUrlHelper;
use App\Helpers\VANumberHelper;
use App\Models\CourierModel;
use App\Models\GatePro\WeighmentService;

include_once(APIPATH.'/helper/fileHelper.php');

class WeighmentService extends Model
{
	// Get Weighment Images
	public function getWeighmentImages($postData) {  
		$dataStatus = false;
		$data = $message = null;
		
		$sql = "CALL spSelCameraDetailsByPlantId(?)";		
		$builder = $this->db->query($sql, [$postData->masterPlantId]);		
		$cameraData = $builder->getResultArray();
		$sapUrlHelperService = new SapUrlHelper();

		if(count($cameraData) > 0){		
			
			foreach($cameraData as $key => $dataValue){				
				// $storagePath = upload_folder($postData->movementType, CCTV_IMG_SRG_PATH);
				$dataValue['imageStoragePath'] = upload_folder($postData->movementType, CCTV_IMG_SRG_PATH);
				$dataValue['firstOrSecondWeight'] = $postData->weighmentInfoId == "" ? 1 : 2;
				$dataValue['key'] = $key;
				$dataValue['vaNumber'] = $postData->vaNumber;
				$result = $sapUrlHelperService->CCTV($dataValue);
				//print_r($result);exit;
				$imagePath = str_replace("/var/www/purchaseprouat/sapfileshare", "https://purchasepro.nagamills.com/sapfileshare", $result);
				$totalImages[] = array(
					'imageUrl' => $imagePath,
					'cctvCameraId' => (int)$dataValue['cctvCameraId']
				);
			}
			$data = $totalImages;
			$dataStatus = true;
		}
		else{
			$message = "Camera details not added.";
		}
		
		return array($dataStatus, $message, $data);;
	}

	// Add Weight Second
	public function addWeightSecond($postData) {  
		$dataStatus = false;
		$data = $message = null;
		
		$sql = "CALL spInsWeightSecond(?, ?, ?, ?, ?, ?)";		
		$builder = $this->db->query($sql, [$postData->vaNo, $postData->truckNo, $postData->firstWeight, $postData->secondWeight, $postData->netWeight, $postData->userInfoId]);
		
		$queryResult = $builder->getResultArray();
		$data = (int)$queryResult[0]['lastInsertId'];
		$getExistCount = (int)$queryResult[0]['getExistCount'];

		if($data > 0 && $getExistCount == 0){
			$dataStatus = true;
			$message = "Second Weight Added";
		}
		elseif($data == 0 && $getExistCount == 1){
			$message = "Second Weight Already Added.";
		}
		else{
			$message = "Please contact Admin.";
		}
		
		return array($dataStatus, $message, $data);;
	}

	// Get Weight Second
	public function getWeightSecond() {     
		$builder = $this->db->query("CALL spSelWeightSecond()");
		$result = $builder->getResultArray();
		return $result;
	}  

	// Add First Weight
	public function addFirstWeight($postData,$moduleTypeId) {  
		$dataStatus = false;
		$data = $message = null;
		
		$sql = "CALL spInsWeighmentInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";		
		$builder = $this->db->query($sql, [$postData->weighmentInfoId, $postData->gateInOutInfoId, $postData->emptyVehicleArrivalId, $postData->purchaseInfoId, $postData->documentNumber, $postData->firstWeight, $postData->secondWeightCheck, $postData->secondWeight, $postData->netWeight, $postData->remarks, $postData->moduleStatusId, $postData->userInfoId]);
		
		$queryResult = $builder->getResultArray();
		$data = (int)$queryResult[0]['lastInsertId'];	
		if($moduleTypeId == 39 && isset($postData->secondWeight) && isset($postData->netWeight)){
			$this->db->table('gate_in_out_info')->set(['moduleStatusId'=>4,'waitingAt'=> 5])->where('id ',$postData->gateInOutInfoId)->update();
		}
		if($data > 0){
			$dataStatus = true;
			$message = "First Weight Successfully...";
		}
		else if($postData->weighmentInfoId > 0){
			$dataStatus = true;
			$message = "Second Weight Successfully...";
		}		
		else{
			$message = "Please contact Admin.";
		}
		
		return array($dataStatus, $message, $data, $getData);
	}

	// Add Image Url
	public function addImageUrl($postData)
	{
	    $data = [];

	    foreach($postData->imageDetails as $row){
		$data[] = [
		    'weighmentInfoId' => $postData->weighmentInfoId,
		    'cctvCameraId' => $row->cctvCameraId,
		    'moduleStatusId' => $postData->moduleStatusId,
		    'imageUrl' => $row->imageUrl,
		    'createdOn' => date('Y-m-d H:i:s')
		];
	    }

	    if(!empty($data)){
		$this->db->table('weighment_images')->insertBatch($data);
	    }

	    return true;
	}

	// Second Weight Gate Info By ID
	public function Second_Weight_Gate_Info_ByID($ID){

		$builder = $this->db->table("gate_in_out_info");
		$builder =  $builder->select("gate_in_out_info.*,case when gate_in_out_info.moduleType = 1 then 'FG-SALES' ELSE 'FG-STO' END AS moduleType,master_color_token.colorToken,master_plant.WERKS");
		$builder = $builder->join('master_color_token', 'master_color_token.id = gate_in_out_info.masterColorTokenId', 'inner');
		$builder = $builder->join('master_plant', 'master_plant.ID = gate_in_out_info.masterPlantId', 'inner');
		$builder =  $builder->where("gate_in_out_info.id",$ID);
		return  $builder->get()->getResultArray();
  	}	

	// Get Weightment Info
	public function getWeighmentInfo($vehicleNo, $gateInOutInfoId, $userInfoId, $documentNumber=null) {
		$dataStatus = false;
		$data = $message = null;

		$builder = $this->db->query("CALL spSelWeighmentInfo('$vehicleNo', '$gateInOutInfoId', '$userInfoId', '$documentNumber')");
		$result = $builder->getResultArray();	

		$vehicleType = $result[0]['vehicleType'];
		$moduleStatusId = $result[0]['moduleStatusId'];
		$secondWeightCheck = $result[0]['secondWeightCheck'];
		$net_weight =  $this->db->query("SELECT net_weight_validation FROM pp_setting where Id = 1");
		$net_weight = $net_weight->getResultArray();	
		$userGateId =  $this->db->query("SELECT masterGateId FROM user_info where UI_ID = $userInfoId");
		$userGateId = $userGateId->getResultArray();
		if(count($result) == 0){
			$dataStatus = false;
			$message = "Please Enter Correct Vehicle";
		}
		else{
			$dataStatus = true;
			$message = "data found";
		}
		
		return array($dataStatus, $message, $result,$net_weight,$userGateId);
	}

	// Get Weighment Document Details
	public function getWeighmentDocumentDetails ($gateInOutInfoId) {
		$builder =  $this->db->query("CALL spSelWeighmentDocumentDetails('$gateInOutInfoId')");
		return  $builder->getResultArray();
	}

	// Redirect Vehicle
	public function rejectWeighmentInfo($postData){
		$dataStatus = false;
		$data = $message = null;
		
		$sql = "CALL spRejectWeighmentDetails(?, ?, ?, ?)";     
		$builder = $this->db->query($sql, [$postData->gateInOutInfoId, $postData->moduleStatusId, $postData->rejectReasonId, $postData->userInfoId]);
		
		$queryResult = $builder->getResultArray();
		$dataCount = (int)$queryResult[0]['dataCount'];
		$countRow = (int)$queryResult[0]['countRow'];

		if($dataCount > 0 && $countRow > 0){
			$dataStatus = true;
			$message = "Rejected Successfully";        
		} 		    
		else{
			$message = "Please contact Admin.";
		}
		return array($dataStatus, $message);
	}

	// Add Test Weighbridge
	public function addTestWeighbridge($postData) {  
		$dataStatus = false;
		$data = $message = null;

		$sql1 = "CALL spGenerateCashNumber(?, ?, ?)";		
		$builder1 = $this->db->query($sql1, [$postData->userInfoId, '', 'testWeighbridge']);
		$getVaNumberResult = $builder1->getResultArray();
		$getVaNumber = $getVaNumberResult[0]['cashNumber'];

		$sql2 = "CALL spGenerateCashNumber(?, ?, ?)";		
		$builder2 = $this->db->query($sql2, [$postData->userInfoId, 23, 'handCarry']);
		$getHandCarryNumberResult = $builder2->getResultArray();
		$getHandCarryNumber = $getHandCarryNumberResult[0]['cashNumber'];	
		
		$sql = "CALL spInsTestWeighbridge(?, ?, ?, ?, ?, ?)";		
		$builder = $this->db->query($sql, [$postData->subModuleTypeId, $postData->vehicleNo ? $postData->vehicleNo : $getHandCarryNumber, $getVaNumber, $postData->masterPlantId,$postData->remarks, $postData->userInfoId]);
		
		$queryResult = $builder->getResultArray();
		$data = (int)$queryResult[0]['lastInsertId'];
		$countRow = (int)$queryResult[0]['countRow'];
		$getExistCount = (int)$queryResult[0]['getExistCount'];

		if($data > 0 && $countRow > 0 && $getExistCount == 0){
			$dataStatus = true;
			$message = "Weighment Test Successfully";
		}
		elseif($data == 0 && $countRow == 0 && $getExistCount > 0){
			$message = "Vehicle Already In.";
		}
		else{
			$message = "Please contact Admin.";
		}
		
		return array($dataStatus, $message, $data);;
	}

	// Get Test Weighbridge
	public function getTestWeighbridge($vehicleNo, $userInfoId, $testWeighbridgeId=null) {  
		$builder = $this->db->query("CALL spSelTestWeighbridge('$vehicleNo', '$testWeighbridgeId', '$userInfoId')");	
		$result = $builder->getResultArray();	
		return  $result;
	}

	// Update Test Weighbridge
	public function updateTestWeighbridge($postData){
		$dataStatus = false;
		$message = null;		
		
		$sql = "CALL spUpdTestWeighbridge(?, ?, ?, ?, ?, ?, ?, ?)";     
		$builder = $this->db->query($sql, [$postData->testWeighbridgeId, $postData->firstWeight, $postData->secondWeight, $postData->netWeight, $postData->remarks, $postData->moduleStatusId, $postData->firstWeightBy, $postData->secondWeightBy]);
		
		$queryResult = $builder->getResultArray();
		$countRow = (int)$queryResult[0]['countRow']; 
		$dataCount = (int)$queryResult[0]['dataCount'];

		if($countRow > 0 && $dataCount > 0){
			$dataStatus = true;
			$message = $postData->moduleStatusId == 14 ? "Updated Successfully" : "Weighment Successfully";        
		}
		else if($countRow == 0 && $dataCount > 0){
			$message = "Status Already Updated";        
		} 
		else{
			$message = "Please contact Admin.";
		}
		return array($dataStatus, $message);
	}

	// Approve Vehicle Status
    public function approveVehicleStatus($postData){
        $dataStatus = false;
        $message = null;
		
		$sql = "CALL spSelGateInOutInfoByLoadingUnloadingId(?)";		
		$builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId]);
		$getGateInOutData = $builder->getResultArray();
		$moduleTypeId = $getGateInOutData[0]['moduleTypeId'];
		$currentDateTime = date("Y-m-d H:i:s");

		$sql = "CALL spSelPurchaseOrderDetails(?, ?)";		
		$builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId, 0]);
		$getPurchaseOrderDetails = $builder->getResultArray();

		if($moduleTypeId == 35){

			$urlPath ="zgatepro/ZREPT_SHR_GP/GatePro_Receipt_Detail_Sharing?sap-client=900";
			
			$sap_data = array (
				"ZZVA_NO" => $getGateInOutData[0]['vaNumber'],
				"ZZTRUCK_NO" => $getGateInOutData[0]['vehicleNo'],
				"ZZPLANT" => $getGateInOutData[0]['werks'],
				"ZZTRANSACTION_TYPE" => $getGateInOutData[0]['moduleType'],
				"ZZLOADING_WGT" => "",
				"ZZEMPTY_WGT" => "",
				"ZZNET_WEIGHT" => "",
				"ZZGATEIN_TIME" => $getGateInOutData[0]['gateInDateStamp'] != '' ? $getGateInOutData[0]['gateInDateStamp'] : $currentDateTime,
				"ZZGATEOUT_TIME" => $currentDateTime,
				"METHOD" => "POST",
				"ZZLINE" => $getPurchaseOrderDetails
			);			

			$res = SapUrlHelper::PushToSap($urlPath,json_encode([$sap_data]));
	
			if(($res[0]->STATUS) == 0){
				$dataStatus = false;
				$message = $res[0]->MESSAGE;

				return array($dataStatus, "$message, Please Contact SAP Team");
			}
			else if(($res[0]->STATUS) > 0){
				$sql = "CALL spApproveVehicle(?, ?)";     
        		$builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId, $postData->userInfoId]);
			}
		}
		else{
			$sql = "CALL spApproveVehicle(?, ?)";     
			$builder = $this->db->query($sql, [$postData->loadingUnloadingInfoId, $postData->userInfoId]);
		}      
        
        $queryResult = $builder->getResultArray();
        $dataCount = (int)$queryResult[0]['dataCount'];
        $countRow = (int)$queryResult[0]['countRow'];
        
        if($countRow > 0 && $dataCount > 0){
            $dataStatus = true;
            $message = "Approved Successfully";  

        } else if($countRow == 0 && $dataCount == 0){
            $message = "vehicle Already Approved";        
        }      
        else{
            $message = "Please contact Admin.";
        }
        return array($dataStatus, $message);
    }

	// Add Test Weighment Info
    public function addTestWeighmentInfo($postData){
        $dataStatus = false;
        $message = null;
        
        $sql = "CALL spInsTestWeighmentInfo(?, ?, ?, ?, ?, ?, ?)";     
        $builder = $this->db->query($sql, [$postData->testWeighmentInfoId, $postData->testWeighbridgeId, $postData->firstWeight, $postData->secondWeight, $postData->netWeight, $postData->remarks, $postData->userInfoId]);
        
        $queryResult = $builder->getResultArray();
        $lastInsertId = (int)$queryResult[0]['lastInsertId'];
        
        if($lastInsertId > 0 && $postData->testWeighmentInfoId == 0){
            $dataStatus = true;
            $message = "First Weight Successfully";  

        } else if($lastInsertId == 0 && $postData->testWeighmentInfoId > 0){
            $dataStatus = true;
            $message = "Second Weight Successfully";      
        }      
        else{
            $message = "Please contact Admin.";
        }
        return array($dataStatus, $message);
    }

	// Get Test Weighbridge
   public function getTestWeighmentInfo($vehicleNo, $testWeighbridgeId, $userInfoId ) {  
		$builder = $this->db->query("CALL spSelTestWeighmentInfo('$vehicleNo', '$testWeighbridgeId', '$userInfoId')");	
		$result = $builder->getResultArray();	
		return  $result;
   }
   
   public function PlantValidation($id, $userInfoId ) {  
		$fetchsql = "SELECT COUNT(*) as count
		FROM gate_in_out_info gioi
		WHERE gioi.id = '$id' AND gioi.masterPlantId IN (SELECT m.PLANT_ID FROM master_user_plant m WHERE m.USER_ID = '$userInfoId')";
		$builder =  $this->db->query($fetchsql);
		return  $builder->getResultArray();
   }

   public function updateWeighmentDetails($postData)
   {
	   // Check if a record with the same gateInOutInfoId already exists
	   $existingRecord = $this->db->table('weighment_info')
								  ->where('gateInOutInfoId', $postData->gateInOutInfoId)
								  ->get()
								  ->getRow();
   
	   // Prepare the values to be inserted or updated
	   $value = array(
		   "gateInOutInfoId" => $postData->gateInOutInfoId,
		   "emptyVehicleArrivalId" => NULL,
		   "purchaseInfoId" => NULL,
		   "firstWeight" => $postData->firstweight,
		   "secondWeight" => $postData->secondweight,
		   "netWeight" => $postData->netweight,
		   "createdBy" => $postData->userInfoId,
	   );
   
	   if ($existingRecord) {
		   // If a record exists, update the existing record
		   $this->db->table('weighment_info')
					->where('gateInOutInfoId', $postData->gateInOutInfoId)
					->update($value);
   
		   // Return the success status and a message
		   return ['status' => 'success', 'message' => 'Weighment details updated successfully'];
	   } else {
		   // If no record exists, insert a new record
		   $this->db->table('weighment_info')->set($value)->insert();
		   $InsID = $this->insertID();
   
		   // Return the success status and inserted ID
		   return ['status' => 'success', 'message' => 'Weighment details inserted successfully', 'InsID' => $InsID];
	   }
   }

   public function GetPoNumbers()
   {
	$builder = $this->db->query("SELECT id as value, poNumber as label FROM purchase_order WHERE poType IN (56, 61) Group BY poNumber ");

	return $builder->getResultArray();
   }
   
   public function getVehicleList($poNumber, $id) {

    // Check if $id is strictly 0 (i.e., only when $id is an integer 0)
    if ($poNumber && $id == 0) {
        $query = $this->db->table('gate_in_out_info gi')
            ->select("po.poNumber, pt.name as poTypeName, po.vendorCode, po.vendorName, sum(wi.netWeight) netWeight,
			pod.quantity, gi.vehicleNo")
            ->join('purchase_order po', 'po.loadingUnloadingInfoId = gi.loadingUnloadingInfoId', 'inner')
            ->join('weighment_info wi', 'wi.gateInOutInfoId = gi.id', 'inner')
            ->join('po_type pt', 'pt.id = po.poType', 'inner')
            ->join('purchase_order_details pod', 'pod.purchaseOrderId = po.id', 'inner')
            ->whereIn('po.poType', [56, 61])
            ->where('po.poNumber', $poNumber)
            ->groupBy('po.poNumber');
		
    } else {
        $query = $this->db->table('gate_in_out_info gi')
            ->select("po.poNumber, po.poType, pt.name as poTypeName, po.vendorCode, po.vendorName, 
                        wi.firstWeight, wi.secondWeight, wi.netWeight, gi.vehicleNo, gi.vaNumber")
            ->join('purchase_order po', 'po.loadingUnloadingInfoId = gi.loadingUnloadingInfoId', 'inner')
            ->join('weighment_info wi', 'wi.gateInOutInfoId = gi.id', 'inner')
            ->join('po_type pt', 'pt.id = po.poType', 'inner')
            ->whereIn('po.poType', [56, 61])
            ->where('po.poNumber', $poNumber);
    }

    // Execute the query and retrieve the result as an array
    $result = $query->get()->getResultArray();

    return $result;
}

public function getLastMigoUniqueNo($gateid)
{
	$builder = $this->db->table('rm_water_details rm');
	$builder->select('rm.id, rm.transcationUniqueNo');
	$builder->join('user_info ui', 'ui.UI_ID = rm.createdBy', 'inner');
	$builder->where('ui.masterGateId', $gateid);
	$builder->orderBy('rm.id', 'DESC');
	$builder->limit(1);

	$result = $builder->get()->getResultArray();

	return $result;
}

public function getGateInOutIds($poNumber)
{
	$builder = $this->db->table('purchase_order po');
	$builder->select('po.gateInOutInfoId');
	$builder->where('po.poNumber', $poNumber);

	$result = $builder->get()->getResultArray();

	return $result;
}

public function InsertRmPurchaseMigoInfo($res, $sap_data, $postData)
{
    $insertedIDs = []; // To store inserted IDs
    $errorMessages = []; // To collect error messages
    $allSuccess = true; // Flag to track if all statuses are 1


    // Check if all responses have STATUS == 1
    foreach ($res as $response) {
        if ($response->STATUS != 1) {
            $allSuccess = false;
            $errorMessages[] = $response->MESSAGE ?? 'Unknown error from SAP';
        }
    }

    // Insert records only if all statuses are 1
    if ($allSuccess) {
        foreach ($res as $response) {
            foreach ($sap_data as $sapItem) {
                $value = [
                    "transcationUniqueNo" => $sapItem->va_no,
                    "poNumber" => $sapItem->po_no,
                    "totalRowCount" => $sapItem->rowCnt ?? 0, // Ensure rowCnt is set
                    "vendorName" => $sapItem->supplier_cod,
                    "grnWeight" => $sapItem->quantity,
                    "vendorInvoiceNo" => $sapItem->bill_no,
                    "invoiceDate" => $sapItem->bill_date,
                    "migoNumber" => $response->MIGO_NO,
                ];

                $this->db->table('rm_water_details')->set($value)->insert();
                $insertedIDs[] = $this->insertID(); // Store the last inserted ID
            }
        }

        // Update purchase order details
        if (!empty($sap_data) ) {
            $updateValue = [
                "moduleStatusId" => 8,
                "waitingAt" => 10,
            ];

            $this->db->table('purchase_order po')
                ->join('gate_in_out_info gi', 'gi.id = po.gateInOutInfoId', 'inner')
                ->where('po.poNumber', $sap_data[0]->po_no) // Corrected field name
                ->update($updateValue);
        } else {
            $allSuccess = false;
            $errorMessages[] = "Missing required data for purchase order update.";
        }
    }

    // Return the final response
    return [
        "success" => $allSuccess,
        "message" => $allSuccess ? "All records inserted successfully." : implode(', ', $errorMessages),
        "inserted_ids" => $allSuccess ? $insertedIDs : []
    ];
}






   

}
