<?php

namespace App\Controllers\Api\Sap;

use App\Controllers\BaseController;
use App\Helpers\SapUrlHelper;
use App\Models\GatePro\GateService;

class SalesConfirmation extends BaseController
{
	public function SalesConfirmationList(){
		include_once APIPATH . "/db_connection.php";
		$gateService = new GateService();
		$gateInData = $gateService->getSalesConfirmationList();

		foreach ($gateInData as $resultRow) {

			$invoiceNumber = $resultRow['invoiceNumber'];	
			//print_r($invoiceNumber);exit;
			$urlPath ="ZGP_INV_DETAILS/Invoicedetails?sap-client=900&&INVOICE_NO=$invoiceNumber"; 
			$sapResult = SapUrlHelper::getWhDatas($urlPath);
			$array = json_decode($sapResult);
	
					$DELIVERY = $array[0]->DELIVERY;
					$CUSTOMER_CODE = $array[0]->CUSTOMER_CODE;
					$CUSTOMER_NAME = $array[0]->CUSTOMER_NAME;
					$DELIVERY_QTY = $array[0]->DELIVERY_QTY;
					$PGI_COMPLETION = $array[0]->PGI_COMPLETION;
					$INVOICE_NO = $array[0]->INVOICE_NO;

		            $currentDate=date("Y-m-d H:i:s");

					$usqls1 = "SELECT id,gateInOutInfoId,invoiceNumber FROM gate_in_out_info_details WHERE invoiceNumber = '$INVOICE_NO' AND status = 0";
					$result = mysqli_query($connect, $usqls1);
					$Fetch = mysqli_fetch_assoc($result);
					$gateInOutInfoId = $Fetch['gateInOutInfoId'];

					 if(isset($INVOICE_NO)){
						$usql = "UPDATE gate_in_out_info_details SET deliveryNumber='$DELIVERY', customerCode ='$CUSTOMER_CODE',customerName ='$CUSTOMER_NAME',deliveryQty = '$DELIVERY_QTY',status = 1,PgiCompletion='$PGI_COMPLETION'  WHERE invoiceNumber='$INVOICE_NO' and status = 0";

						$res=mysqli_query($connect, $usql);

						$usqls = "SELECT COUNT(*) AS getExistCount FROM gate_in_out_info_details WHERE gateInOutInfoId='$gateInOutInfoId' and status = 0";

						$result = mysqli_query($connect, $usqls);
						$Fetch = mysqli_fetch_assoc($result);
						$getExistCount = $Fetch['getExistCount'];
						  if($getExistCount == 0){
							$usql1 = "UPDATE gate_in_out_info SET  waitingAt = 8 WHERE  id = '$gateInOutInfoId'";
							$res1=mysqli_query($connect, $usql1);
						  }
						}else{
						$res = false;
					}
		}			
		return json_encode(["success" => 1, "results" =>  $res]);
	}

}

