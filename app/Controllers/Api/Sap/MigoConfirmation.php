<?php

namespace App\Controllers\Api\Sap;

use App\Controllers\BaseController;
use App\Helpers\SapUrlHelper;
use App\Models\GatePro\GateService;

class MigoConfirmation extends BaseController
{
	public function migoConfirmationDetails() {
		include_once APIPATH . "/db_connection.php";
		$gateService = new GateService();
		$gateInData = $gateService->getMigoConfirmationVehicleDetails();		
	
		foreach ($gateInData as $resultRow) {
			$vaNumber = $resultRow['vaNumber'];				
			$load_id  = $resultRow['loadingUnloadingInfoId'];
	
			/**
			 * 🔎 Step 1: Validate PO Type
			 */
			$usqls3 = "SELECT poType, serviceStatus 
					   FROM purchase_order 
					   WHERE loadingUnloadingInfoId = $load_id";
	
			$result1 = mysqli_query($connect, $usqls3);
	
			$hasEmptyPoType = false;
			while ($row = mysqli_fetch_assoc($result1)) {
				if (empty($row['poType'])) {
					$hasEmptyPoType = true;
					break;
				}
			}
	
			if ($hasEmptyPoType) {
				$usql4 = "UPDATE gate_in_out_info 
						  SET moduleStatusId = 7, 
							  waitingAt = 7,
							  remarks = 'PO NO MISSING'
						  WHERE vaNumber = '$vaNumber' 
							AND moduleType IN (12,15,21,16,33,34,35,25,38,45)";
				mysqli_query($connect, $usql4);
				continue; // stop here for this record
			}
	
			/**
			 * 🔎 Step 2: Check if all MIGO Numbers already exist
			 */
			$usqls = "SELECT COUNT(*) AS getExistCount 
					  FROM purchase_order 
					  WHERE loadingUnloadingInfoId = $load_id 
						AND (migoNumber IS NULL OR migoNumber = '') 
						AND isDelete = 0";
	
			$result = mysqli_query($connect, $usqls);
			$Fetch  = mysqli_fetch_assoc($result);
			$getExistCount = $Fetch['getExistCount'];
	
			if ($getExistCount == 0) {
				$usql = "UPDATE gate_in_out_info 
						 SET moduleStatusId = 10, waitingAt = 8 
						 WHERE vaNumber = '$vaNumber' 
						   AND moduleType IN (12,15,21,16,33,34,35,25,38,45)";
				mysqli_query($connect, $usql);
			}
		}
	
		return json_encode(["success" => 1]);
	}
	public function migoConfirmationSTO(){
		include_once APIPATH . "/db_connection.php";
		$gateService = new GateService();
		//print_r('$gateInData');exit;
		$gateInData = $gateService->getMigoConfirmationVehicleDetailSTO();
		foreach ($gateInData as $resultRow) {

			$vaNumber = $resultRow['vaNumber'];
			$usqls1 = "SELECT id,movementType FROM gate_in_out_info WHERE vaNumber = '$vaNumber' AND waitingAt = 10";
			$result = mysqli_query($connect, $usqls1);
			$Fetch = mysqli_fetch_assoc($result);
			$gateInOutInfoId = $Fetch['id'];
			$moduleTypeId = $Fetch['moduleTypeId'];
						
			$urlPath ="zgatepro/zgp_pm_migo_det/Gatepro?sap-client=900&&VA_NO=$vaNumber";
			$sapResult = SapUrlHelper::getWhDatas($urlPath);
			$array = json_decode($sapResult);
						//print_r($array);exit;			
			foreach ($array as $resultRow) {
				//foreach ($resultRow->LINE_ITEM as $lineItem) {	

					$lineItem = $resultRow->LINE_ITEM;
					$MIGO = $lineItem[0]->MIGO_NO;
					$DELIVERY = $lineItem[0]->DELIVERY;
					$VANUMBER = $resultRow->VA_NUMBER;				
		            $currentDate=date("Y-m-d H:i:s");
					 foreach ($lineItem as $line) {
					 if(isset($MIGO)){
						$usql = "UPDATE sto_loading_info SET migoNumber='$line->MIGO_NO', migoDate ='$currentDate' WHERE deliveryNumber='$line->DELIVERY' and migoNumber = 0";
						$usql1 = "UPDATE gate_in_out_info SET moduleStatusId=10, waitingAt = 8 WHERE  vaNumber = '$VANUMBER' AND waitingAt = 10";
						$res=mysqli_query($connect, $usql);
						$res1=mysqli_query($connect, $usql1);
						}else{
						$res = false;
					}
					}
				//}
			}
		}			
		return json_encode(["success" => 1, "results" =>  $res1]);
	}
	
	public function updateLoadingUnloadingInfoStatus(){

		$fetchData = array();
		
		include_once APIPATH . "/db_connection.php";

		$currentDate=date("Y-m-d");
		$usqls = "SELECT id FROM loading_unloading_info WHERE moduleTypeId In (14,27,29,37,42) AND statusId IN(0,1) AND toDate < '$currentDate'";
		$result = mysqli_query($connect, $usqls);
  
		if ($result->num_rows > 0)  { 
			while($row = $result->fetch_assoc()) { 

				$loadingUnloadingInfoId =  $row["id"];

				$usql = "UPDATE loading_unloading_info SET statusId = 8 WHERE id = $loadingUnloadingInfoId";
				$res = mysqli_query($connect, $usql);
			} 
		}  
		else { 
			$res = false;
		} 		
		return json_encode(["success" => 1, "results" =>  $res]);
	}
}

