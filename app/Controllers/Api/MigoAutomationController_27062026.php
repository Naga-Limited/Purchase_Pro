<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Helpers\SapUrlHelper;
use App\Helpers\VANumberHelper;
use App\Models\MigoAutomationModel;
use CURLFile;
use DateTime;
include_once(APIPATH.'/helper/fileHelper.php');

class MigoAutomationController extends BaseApiController
{
	public function ReceiptDetailsGet($fromDate, $toDate, $moduleTypeId, $userInfoId,$vaNumber)
	{
		$gateService = new MigoAutomationModel();
		$results = $gateService->ReceiptDetailsGet($fromDate, $toDate, $moduleTypeId, $userInfoId,$vaNumber);
		$results1 = $gateService->ReceiptDetailsGetMultiplePO($fromDate, $toDate, $moduleTypeId, $userInfoId,$vaNumber);
		// Merge results
		$mergedResults = array_merge($results, $results1);
		// print_r($mergedResults);exit;

		$dataStatus = count($mergedResults) > 0;
		$message = $dataStatus ? 'Data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $mergedResults]);
	}
	public function GetVaNumbers($fromDate, $toDate, $moduleTypeId, $userInfoId){
		$gateService = new MigoAutomationModel();
		$results = $gateService->GetVaNumbers($fromDate, $toDate, $moduleTypeId, $userInfoId);

		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
	public function getPurchaseInfo($purchaseId, $userInfoId,$poNumbers) {
		$gateService = new MigoAutomationModel();    
		$result = $gateService->getPurchaseInfo($purchaseId, $userInfoId,$poNumbers);
		$result1 = $gateService->getMaterialDetail($purchaseId, $poNumbers);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
		$message1 = $result1[0]['message'] ? $result1[0]['message'] : '';
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result , "materialDetails" => $result1,'message1'=>$message1]);
	} 
	public function ReceiptDetailsPost() {
		$json = $this->request->getJSON();
		// print_r($json);exit;
		$gateService = new MigoAutomationModel();    
		$result = $gateService->ReceiptDetailsPost($json);
		$dataStatus = $result[0] > 0 ? true : false;
		$message = $result[1];
	
		return  $this->respond(["success" => $dataStatus, "message" => $message]);
	}

	public function ReceiptDetailsGetByUsers($status,$user_id,$fromDate = null,$toDate = null) {
		$json = $this->request->getJSON();
		$gateService = new MigoAutomationModel();    
		$result = $gateService->ReceiptDetailsGetByUsers($status,$user_id,$fromDate,$toDate);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	public function getPurchaseInfoByUsers($purchaseId, $userInfoId,$status) {
		$gateService = new MigoAutomationModel();    
		$result = $gateService->getPurchaseInfo($purchaseId, $userInfoId);
		$result1 = $gateService->getMaterialDetailList($purchaseId, $status);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result , "materialDetails" => $result1]);
	} 

	public function ReceiptDetailsUpdate() {
		$gateService = new MigoAutomationModel();
		$json = $this->request->getJSON();    
		$result = $gateService->ReceiptDetailsUpdate($json);
		$dataStatus = $result[0] > 0 ? true : false;
		$message = $result[1];
	
		return  $this->respond(["success" => $dataStatus, "message" => $message]);
	}
	public function StorageLocationFetch($plant) {
		$gateService = new MigoAutomationModel();
		   
		$result = $gateService->StorageLocationFetch($plant);
		return $this->sendSuccessResult($result);
	}

	public function sendFileToInvoiceParser(){
		$file = $this->request->getFile('file');
		$PLANT_IDS = $this->request->getPost('PLANT_IDS');

		if (!$file->isValid()) {
			return $this->response->setJSON(['error' => 'Invalid file']);
		}

		$tempPath = $file->getTempName();

		$curl = curl_init();
		$postFields = [
			'file' => new CURLFile($tempPath, $file->getMimeType(), $file->getName())
		];

		curl_setopt_array($curl, [
			CURLOPT_URL => OCR_URL,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_POST => true,
			CURLOPT_POSTFIELDS => $postFields,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_HEADER => false,
			CURLOPT_HTTPHEADER => [
            'x-api-key: '.OCR_URL_KEY.''
        ]
		]);

		$response = curl_exec($curl);
		$err = curl_error($curl);
		curl_close($curl);
		if ($err) {
			return $this->response->setJSON(['error' => $err]);
		}

		$decoded = json_decode($response, true);
		$invoiceData = [];
		foreach ($decoded ?? [] as $item) {
			$invoiceNo = isset($item['Invoice Number']) ? trim($item['Invoice Number']) : '';
			$poNumbersRaw = $item['Purchase Order Number'] ?? ($item['Purchase Order Numbers'] ?? []);
            $poNumbersArray = is_array($poNumbersRaw) ? $poNumbersRaw : [$poNumbersRaw];

			// Format Invoice Date to Y-m-d
			$rawDate = trim($item['Invoice Date'] ?? '');
			$invoiceDate = '';
			// $formats = ['d-M-y', 'd-m-Y', 'd/m/Y', 'Y-m-d', 'd.m.Y', 'm/d/Y', 'M d, Y', 'd M Y'];
			$gateService = new MigoAutomationModel();
			$rawFormats = $gateService->DateFormat();
			$formats = array_column($rawFormats, 'dateFormat');
			// print_r($formats);exit;
			// $formats = [
			// 	'd-M-y',   // 02-Jan-25
			// 	'j-M-y',   // 2-Jan-25
			// 	'd-M-Y',   // 02-Jan-2025
			// 	'j-M-Y',   // 2-Jan-2025
			// 	'd-m-Y',   // 02-01-2025
			// 	'j-m-Y',   // 2-01-2025
			// 	'd/m/Y',   // 02/01/2025
			// 	'j/n/Y',   // 2/1/2025
			// 	'Y-m-d',   // 2025-01-02
			// 	'd.m.Y',   // 02.01.2025
			// 	'j.n.Y',   // 2.1.2025
			// 	'm/d/Y',   // 01/02/2025 (US format)
			// 	'n/j/Y',   // 1/2/2025 (US short)
			// 	'M d, Y',  // Jan 02, 2025
			// 	'M j, Y',  // Jan 2, 2025
			// 	'd M Y',   // 02 Jan 2025
			// 	'j M Y',   // 2 Jan 2025
			// 	'D, d M Y', // Thu, 02 Jan 2025
			// 	'l, d M Y', // Thursday, 02 Jan 2025
			// 	'Y/m/d',   // 2025/01/02
			// 	'd/m/y',   // 02/01/25
			// 	'j-M-y',   // 2-Jan-25
			// 	'j M y',   // 2 Jan 25
			// 	'j-n-y', // 5-2-25
			// 	'j-n-Y'  // 5-2-2025
			// ];
			// print_r($rawDate);exit;
			foreach ($formats as $format) {
				$normalizedDate = $rawDate;
			
				if ($format === 'M_dMY_UPPERCASE') {
					// Handles 20MAY2025
					if (preg_match('/^(\d{2})([A-Z]{3})(\d{4})$/', $rawDate, $matches)) {
						$day = $matches[1];
						$month = ucfirst(strtolower($matches[2]));
						$year = $matches[3];
						$converted = "$day-$month-$year";
						$date = DateTime::createFromFormat('d-M-Y', $converted);
						if ($date) {
							$invoiceDate = $date->format('Y-m-d');
							break;
						}
					}
			
				} elseif ($format === 'M_dMY_UPPERCASE_SHORTYEAR') {
					// Handles 20MAY25
					if (preg_match('/^(\d{2})([A-Z]{3})(\d{2})$/', $rawDate, $matches)) {
						$day = $matches[1];
						$month = ucfirst(strtolower($matches[2]));
						$year = $matches[3];
						$converted = "$day-$month-$year";
						$date = DateTime::createFromFormat('d-M-y', $converted); // short year
						if ($date) {
							$invoiceDate = $date->format('Y-m-d');
							break;
						}
					}
			
				} else {
					// Default date parsing with normalization
					if (strpos($format, 'M') !== false) {
						$normalizedDate = preg_replace_callback(
							'/\b([A-Z]{3})\b/',
							fn($m) => ucfirst(strtolower($m[1])),
							$rawDate
						);
					}
			
					$date = DateTime::createFromFormat($format, $normalizedDate);
					if ($date && $date->format($format) === $normalizedDate) {
						$invoiceDate = $date->format('Y-m-d');
						break;
					}
				}
			}

			if (empty($invoiceDate)) {
				return $this->response->setJSON(['error' => "Invalid Invoice Date format for invoice: $invoiceNo"]);
			}
	
			if (empty($invoiceNo)) {
				return $this->response->setJSON(['error' => "Missing Invoice No for provided PO numbers."]);
			}

		   foreach ($poNumbersArray as $poRaw) {
				// Step 1: Remove whitespace
				$cleaned = preg_replace('/\s+/', '', $poRaw);
				// Step 2: Keep only digits
				$cleaned = preg_replace('/[^0-9]/', '', $cleaned);
				// Step 3: Extract PO number (expecting 9–10 digits)
				$poNumber = '';
				if (preg_match('/^\d{8,10}/', $cleaned, $matches)) {
					$poNumber = $matches[0];
				}
	
				if (empty($poNumber)) {
					return $this->response->setJSON(['error' => "Invalid PO Number format: $poRaw"]);
				}
	
				// Prevent duplicates
				$key = $poNumber . '|' . $invoiceNo;
				if (!isset($invoiceData[$key])) {
					$invoiceData[$key] = [
						'poNumber'    => $poNumber,
						'invoiceNo'   => $invoiceNo,
						'invoiceDate' => $invoiceDate
					];
				}
			}
		}
		// Prepare merged PO + invoice result
		// print_r($invoiceData);exit;
		$mergedResults = [];

		foreach ($invoiceData as $entry) {
			$poNumber = $entry['poNumber'];
			$urlPath = "zgatepro/ZGP_Unloading/Gatepro_Fg_Uloading?sap-client=900&&Po_No=$poNumber";
			$data = SapUrlHelper::getWhDatas($urlPath);
			$result = json_decode($data, true);
			if (!empty($result)) {
				foreach ($result as $poItem) {
					$poItem['invoiceNo'] = $entry['invoiceNo'];
					$poItem['invoiceDate'] = $entry['invoiceDate'];
					$poItem['invoiceCopy'] = $file;
					$mergedResults[] = $poItem;
				}
			}
		}
		if (empty($mergedResults)) {
			return $this->response->setJSON(['error' => 'No PO details found for the provided invoice(s).']);
		}elseif($mergedResults[0]['PO_NO'] == ''){
			return $this->response->setJSON(['error' => "No PO details found for the provided invoice(s):{$entry['poNumber']}"]);
		}else{
		 return  $this->respond(["success" => true , "message" => 'data found', "data" => $mergedResults]);
		}
	}

	public function ReceiptDetailsChange($fromDate, $toDate, $moduleTypeId, $userInfoId,$vaNumber)
	{
		$gateService = new MigoAutomationModel();
		$results = $gateService->ReceiptDetailsChange($fromDate, $toDate, $moduleTypeId, $userInfoId,$vaNumber);

		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}

	public function getPurchaseInfoByUsersId($purchaseId, $userInfoId) {
		 //print_r($purchaseId);exit;
	    // ✅ Validate purchaseId
	    if ($purchaseId === "null") {
		return $this->respond([
		    "success" => false,
		    "message" => "No Purchase ID provided",
		    "results" => []
		]);
	    }

		$gateService = new MigoAutomationModel();    
		$result = $gateService->getPurchaseInfoByUsersId($purchaseId, $userInfoId);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	public function PoChangeUpdate() {
		$gateService = new MigoAutomationModel(); 
		$json = $this->request->getJSON();    
		$result = $gateService->PoChangeUpdate($json);
		$dataStatus = $result[0] > 0 ? true : false;
		$message = $result[1];
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	public function getMiroDetails($poNumber,$userId) {
		$gateService = new MigoAutomationModel(); 
		$json = $this->request->getJSON();
		$urlPath = "zzgp_api/zzgp_migo/GP_MIR7?sap-client=900&po_number=$poNumber";
		$data = SapUrlHelper::getWhDatas($urlPath);
		$result = json_decode($data, true);
		$miroCheckResults = [];
		foreach ($result as $item) {
			$poLine = $item['PO_ITEM'];
			$migoNumber = $item['REF_NO'];
			$PO_NUMBER = $item['PO_NUMBER'];
			// Check if necessary fields exist
			if (!empty($poLine) && !empty($migoNumber) && !empty($PO_NUMBER)) {
				$checkResult = $gateService->miroDatailsCheck($PO_NUMBER, $poLine, $migoNumber, $userId);
		
				// Check if a match exists from the DB side
				if (!empty($checkResult)) {
					// Optional: extra validation to match each record if needed
					foreach ($checkResult as $row) {
						if ($row['lineItem'] == $poLine && $row['migoNumber'] == $migoNumber) {
							$item['miro_check'] = $checkResult;
							$miroCheckResults[] = $item;
							break; // Once matched, move to next item
						}
					}
				}
			}
		}
		$dataStatus = count($miroCheckResults) > 0;
		$message = $dataStatus ? 'Data found' : 'No data';
	  return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $miroCheckResults,"Actual"=>$result]);
	}

	public function MiroPosting() {
		$gateService = new MigoAutomationModel(); 
		$json = $this->request->getJSON();
		$sapData = [];
		$lineItemCounter = 1;
		$miroData = [];
		$data = $gateService->MiroLastID($json->poData[0]->miro_check[0]->plantCode);
		$transcation_unique_no = $data[0]['miroId'];
		$res = VANumberHelper::VANumberHelper('PT','MIRO', $transcation_unique_no);
		// $vendorCode = $json->selectedVendorValue ?? $json->poData[0]->VENDOR ?? '';
		$vendorCode = $json->selectedVendorValue 
		?? ($json->poData[0]->VENDOR ?? null) 
		?? rand(100, 999);
		$currentDateTime = date('dmyHis');
		$uniqueCode = $currentDateTime . $vendorCode;
		foreach ($json->poData as $item) {
			$sap_data_array = [
				"line_item" => $lineItemCounter++, // Increment line item counter
				"po_number" => $item->PO_NUMBER,
				"po_item" => $item->PO_ITEM,
				"ref_no" => $item->REF_NO,
				"ref_line" => $item->REF_LINE,
				"year" => $item->YEAR,
				"condition" => $item->CONDITION,
				"vendor" => $item->VENDOR,
				"tax_code" => $item->TAX_CODE,
				"item_amount" => $item->ITEM_AMOUNT, // Ensure this is the correct field
				"quantity" => $item->QUANTITY,
				"po_unit" => "$item->PO_UNIT",
				"item_text" => $json->remarks,
				"valuation_type" => $item->VALUATION_TYPE,
				"MIRO_ID" => $uniqueCode ?? $res, // Use generated unique code or fallback to res
			];
			$data = [
				"lineItem" => $lineItemCounter++, // Increment line item counter
				"poNumber" => $item->PO_NUMBER,
				"poItem" => $item->PO_ITEM,
				"refNo" => $item->REF_NO,
				"refLine" => $item->REF_LINE,
				"migoNumber"=>$item->MIGO_NUMBER,
				"migoLine"=>$item->MIGO_LINE,
				"year" => $item->YEAR,
				"condition" => $item->CONDITION,
				"vendor" => $item->VENDOR,
				"taxCode" => $item->TAX_CODE,
				"amount" => $item->ITEM_AMOUNT, // Ensure this is the correct field
				"quantity" => $item->QUANTITY,
				"poUnit" => "$item->PO_UNIT",
				"itemText" => $json->remarks,
				"valuationType" => $item->VALUATION_TYPE,
				"docDate" => $json->poData[0]->miro_check[0]->invoiceDate,
				"postingDate" => $json->postingDate,
				"refDocNo" => $json->poData[0]->miro_check[0]->invoiceNo, // SAP
				"compCode" => $json->poData[0]->COMP_CODE,
				"currency" => $json->poData[0]->CURRENCY, // SAP
				"head_text" => $json->remarks,
				"gross_amount" => $json->totalAmount, // SAP
				"receiptEntryId" => $json->poData[0]->miro_check[0]->id,
				"invoiceCopy" => $json->poData[0]->miro_check[0]->invoiceCopy,
				"plantCode" => $json->poData[0]->miro_check[0]->plantCode,
				"status"=>1,
				"createdBy"=>$json->userId,
				"miroId"=> $uniqueCode ?? $res
			];
			$sapData[] = $sap_data_array;
			$miroData[] = $data;
		}
		$docDate = date('Ymd', strtotime($json->poData[0]->miro_check[0]->invoiceDate));
        $postingDate = date('Ymd', strtotime($json->postingDate));
		// Prepare data to send to SAP
		$sap_data_array2 = [
			"doc_date" => $docDate,
			"psting_date" =>  $postingDate,
			"ref_doc_no" => $json->poData[0]->miro_check[0]->invoiceNo, // SAP
			"comp_code" => $json->poData[0]->COMP_CODE,
			"currency" => $json->poData[0]->CURRENCY, // SAP
			"head_text" => $json->remarks,
			"gross_amount" => $json->totalAmount, // SAP
			"sap_Line" => $sapData
		];
		$urlPath1 = "zzgp_api/zzgp_plant/plant?sap-client=900";
        $res = SapUrlHelper::PushToSap($urlPath1, json_encode([$sap_data_array2]));
		$message = $res[0]->MESSAGE ?? 'No message from SAP';
		$DOCUMENT_NO = $res[0]->MIRO_NO ?? '';
		$status = $res[0]->STATUS ?? 0;
        if ($status == 0) {
			return  $this->respond(["success" => false, "message" => "$message , Please Contact SAP Team", "results" => '']);
		}else if ($status > 0) {

			foreach ($miroData as &$lineItem) {
				$lineItem['miroNo'] = $DOCUMENT_NO;
			}
			unset($lineItem);
			
		$result = $gateService->MiroPosting($miroData);
		$dataStatus = $result > 0 ? true : false;
		$message = "Submitted Successfully . The MIRO No is $DOCUMENT_NO";
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
		}else{
			return  $this->respond(["success" => false, "message" => "$message , Please Contact SAP Team", "results" => '']);
		}
	}

	public function ReceiptDetailReport($fromDate, $toDate, $moduleTypeId, $userInfoId)
	{
		$gateService = new MigoAutomationModel();
		$results = $gateService->ReceiptDetailReport($fromDate, $toDate, $moduleTypeId, $userInfoId);
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}

	public function MigoReverse()
	{
		$gateService = new MigoAutomationModel();
		$results = $gateService->MigoReverse();
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}

	public function getPoNumbers($userInfoId,$fromDate,$toDate,$plantCode=null) {
		$gateService = new MigoAutomationModel();    
		$result = $gateService->getPoNumbers( $userInfoId,$fromDate,$toDate,$plantCode);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	public function getMiroDetailsById() {
		$gateService = new MigoAutomationModel();
		$json = $this->request->getJSON();
		$result = $gateService->getMiroDetailsById($json);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	public function getVendorList() {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->getVendorList($json->PoNumbers);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function MiroUpdate() {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		// print_r($json);exit;
		$result = $gateService->MiroUpdate($json);
		return $this->respond([
			"success" => $result['success'], 
			"message" => $result['message'],
			"results" => $result // Full response if you want
		]);
	}

	public function getMiroDetailsList($userId,$fromDate,$toDate,$status,$plantCode=null) {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->getMiroDetailsList($userId,$fromDate,$toDate,$status,$plantCode);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	public function MiroUpdateSAP() {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->MiroUpdateSAP($json);
		return $this->respond([
			"success" => $result['success'], 
			"message" => $result['message'],
			"results" => $result['results'],
		]);
	}

	public function MiroReverse()
	{
		$gateService = new MigoAutomationModel();
		$results = $gateService->MiroReverse();
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
	public function MiroDetailReport($fromDate, $toDate, $moduleTypeId, $userInfoId,$status,$plantCode=null,$Userplant=null)
	{
		$gateService = new MigoAutomationModel();
		$results = $gateService->MiroDetailReport($fromDate, $toDate, $moduleTypeId, $userInfoId,$status,$plantCode,$Userplant);
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
	public function MiroStatus()
	{
		$gateService = new MigoAutomationModel();
		$results = $gateService->MiroStatus();
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
	public function TDSFetch($vendor) {
		$gateService = new MigoAutomationModel();
		   
		$result = $gateService->TDSFetch($vendor);
		return $this->sendSuccessResult($result);
	}

	public function getRejectDetailsList($userId,$fromDate,$toDate) {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->getRejectDetailsList($userId,$fromDate,$toDate);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	public function RejectMiroEntry() {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->RejectMiroEntry($json);
		return $this->respond([
			"success" => $result['success'], 
			"message" => $result['message'],
		]);
	}

	public function getPOCopy($poNumber,$type) {
		$json = $this->request->getJSON();
	
		if (empty($poNumber)) {
			return $this->respond([
				"success" => false,
				"message" => "PO number is required",
				"results" => []
			]);
		}
		if($type == 'PO'){
			$urlPath = "zzgp_api/zzgp_migo/GP_SF_GET?sap-client=900&PO=$poNumber";
		}else if ($type == 'GRN'){
			$urlPath = "zzgp_api/zzgp_migosf/MIGO_SF?sap-client=900&MIGO=$poNumber";
		}
		$data = SapUrlHelper::getWhDatas($urlPath);
		$result = json_decode($data, true);
		if($type == 'PO'){
			$dataStatus = is_array($result) && count($result) > 0 && isset($result[0]['PO_64']);
			$message = $dataStatus ? 'Base64 PDF found' : 'No PDF data';
			$base64_pdf = $result[0]['PO_64'];
		}else if($type == 'GRN'){
			$dataStatus = is_array($result) && count($result) > 0 && isset($result[0]['MIGO_64']);
			$message = $dataStatus ? 'Base64 PDF found' : 'No PDF data';
			$base64_pdf = $result[0]['MIGO_64'];
		}
	
		return $this->respond([
			"success" => $dataStatus,
			"message" => $message,
			"poNumber" => $poNumber,
			"base64_pdf" => $dataStatus ? $base64_pdf : null
		]);
	}

	public function addGateInPODetails() {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->addGateInPODetails($json);
		$dataStatus = $result[0];
		$message = $result[1];
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function addGateIn() {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->addGateIn($json);
		$dataStatus = $result[0];
		$message = $result[1];
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	public function updateGateInPODetails() {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->updateGateInPODetails($json);
		$dataStatus = $result[0];
		$message = $result[1];
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

    public function getMiroDetailsRMwheat()
    {
        $db = db_connect();

        $builder = $db->table('purchase_info pi');
		$builder->select('
			pi.MIGO_NUM,
			pi.PI_REFID,
			sdi.supp_inv_copy as INV_COPY,
			sdi.supp_wb_copy as WB_COPY,
			sdi.invoice_date as ZSUPPLIER_INV_DT,
			sdi.invoice_no as ZSUPPLIER_INV_NO,
			sdi.naga_os_wb_copy as naga_os_wb_copy
		');
		
		$builder->join(
			'gateout_info sdi',
			'sdi.purchase_info_id = pi.PI_REFID',
			'inner'
		);
		

		$builder->where('pi.VECHICAL_STATUS', 7);
		$builder->where('pi.payment_status', 1);
		$builder->where('pi.MIGO_NUM IS NOT NULL', null, false);
		$builder->where("pi.MIGO_NUM != ''");
		$builder->where("pi.VEHICLE_TYPE IN ('Truck','Rake','Container','FCI Truck')"); // Assuming 1 and 3 are the codes for the specific vehicle types you want to include
		$builder->groupBy('pi.PI_REFID');
		$builder->orderBy('pi.PI_REFID', 'ASC');
		$builder->limit(50); // Optional: limit for testing, remove or adjust as needed

		$purchaseInfos = $builder->get()->getResultArray();


        $insertCount = 0;
        $updateCount = 0;
        $processedItems = []; // for debugging/tracking
        $currentDate = date('Y-m-d');
        $userId = 0; // replace with session user id if needed

        foreach ($purchaseInfos as $row) {
            $migoNumber = $row['MIGO_NUM'];
            $piRefId    = $row['PI_REFID'];
			$INV_COPY    = $row['INV_COPY'];
			$WB_COPY    = $row['WB_COPY'];
			$ZSUPPLIER_INV_NO    = $row['ZSUPPLIER_INV_NO'];
			$ZSUPPLIER_INV_DT    = $row['ZSUPPLIER_INV_DT'];
			$naga_os_wb_copy    = $row['naga_os_wb_copy'];
            $urlPath = "zzgp_api/zzgp_migo/GP_MIGO_GET?sap-client=900&migo=$migoNumber";
            $sapData = SapUrlHelper::getWhDatas($urlPath);
            $resultData = json_decode($sapData);
            if (!empty($resultData)) {
                foreach ($resultData as $resultRow) {
                    $REF_NO    = $resultRow->REF_NO ?? null;
                    $PO_NUMBER = $resultRow->PO_NUMBER ?? null;
                    $PO_ITEM   = $resultRow->PO_ITEM ?? null;
                    $GL        = $resultRow->GL ?? null;

                    if ($REF_NO && $PO_NUMBER && $PO_ITEM && $GL) {

                        $exists = $db->table('miro_entry')
                            ->where([
                                'refNo'    => $REF_NO,
                                'poNumber' => $PO_NUMBER,
                                'poItem'   => $PO_ITEM,
                                'gl'       => $GL
                            ])
                            ->whereIn('status', [1, 2, 3, 4])
                            ->countAllResults();

                        if ($exists == 0) {
                            $insertData = [
                                "lineItem" => $resultRow->BUZEI ?? null,
                                "poNumber" => $PO_NUMBER,
                                "poItem" => $PO_ITEM,
                                "refNo" => $REF_NO,
                                "refLine" => $resultRow->REF_LINE ?? null,
                                "migoNumber" => $resultRow->MIGO_NUMBER ?? $migoNumber,
                                "migoLine" => $resultRow->MIGO_LINE ?? null,
                                "year" => $resultRow->YEAR ?? null,
                                "condition" => $resultRow->CONDITION ?? null,
                                "vendor" => $resultRow->VENDOR ?? null,
                                "taxCode" => $resultRow->TAX_CODE ?? null,
                                "amount" => $resultRow->ITEM_AMOUNT ?? 0,
                                "quantity" => $resultRow->QUANTITY ?? 0,
                                "poUnit" => $resultRow->PO_UNIT ?? null,
                                "itemText" => $resultRow->DESCRIPTION ?? '',
                                "gl" => $GL,
                                "valuationType" => $resultRow->VALUATION_TYPE ?? null,
                                "docDate" => $ZSUPPLIER_INV_DT,
                                "postingDate" => $currentDate,
                                "refDocNo" => $ZSUPPLIER_INV_NO,
                                "compCode" => $resultRow->COMP_CODE ?? null,
                                "currency" => $resultRow->CURRENCY ?? null,
                                "gross_amount" => $resultRow->ITEM_AMOUNT ?? 0,
                                "purchaseInfoId" => $piRefId,
                                "plantCode" => $resultRow->PLANT ?? null,
                                "paymentMethod" => $resultRow->PAYMENT_METHOD ?? null,
                                "profitCenter" => $resultRow->PROFIT_CENTER ?? null,
                                "costCenter" => $resultRow->COSTCENTER ?? null,
                                "fiDocument" => $resultRow->FI_DOC ?? null,
                                "status" => 1,
                                "createdBy" => $userId,
                                "vendorName" => $resultRow->VENDOR_NAME1 ?? null,
                                "totalTax" => $resultRow->TOTAL_TAX ?? 0,
                                "conditionDetails" => $resultRow->CONDITION_INT ?? null,
                                "orderQty" => $resultRow->ORDER_QTY ?? 0,
                                "orderUnit" => $resultRow->ORDER_UNIT ?? null,
                                "serviceLine" => $resultRow->SER_LINE ?? null,
								"invoiceCopy" => $INV_COPY ?? null,
								"vendorWBCopy" => $WB_COPY ?? null,
								"externalWbCopy" => $naga_os_wb_copy ?? null,
								"attach" => $resultRow->ATTACHMENT == 'attach' ? 1 : 0,
								// "conditionName"=> $resultRow->CONDITION_NAME ?? null,
                            ];

                            $db->table('miro_entry')->insert($insertData);
                            $insertCount++;

                            $db->table('purchase_info')
                                ->where('PI_REFID', $piRefId)
                                ->set(['payment_status' => 2])
                                ->update();

                            $updateCount++;
                        } else {
                            $db->table('purchase_info')
                                ->where('PI_REFID', $piRefId)
                                ->set(['payment_status' => 2])
                                ->update();

                            $updateCount++;
                        }
                    }
                }
            }

            $processedItems[] = [
                'MIGO_NUM' => $migoNumber,
                'PI_REFID' => $piRefId
            ];
        }

        return $this->response->setJSON([
            "success" => true,
            "message" => "MIRO entries processed successfully.",
            "inserted" => $insertCount,
            "updated" => $updateCount,
            "processed" => $processedItems
        ]);
    }
	public function getPoNumbersWheat($userInfoId,$fromDate,$toDate,$plantCode,$type) {
		$gateService = new MigoAutomationModel();    
		$result = $gateService->getPoNumbersWheat($userInfoId,$fromDate,$toDate,$plantCode,$type);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function getPoNumbersWheatCondition($userInfoId,$fromDate,$toDate,$plantCode,$type) {
		$gateService = new MigoAutomationModel();    
		$result = $gateService->getPoNumbersWheatCondition($userInfoId,$fromDate,$toDate,$plantCode,$type);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function getVendorListWheat() {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->getVendorListWheat($json->PoNumbers);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found Vendor';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function getCondtionWheat() {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->getCondtionWheat($json->PoNumbers);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found Condtion';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function getMiroDetailsByIdWheat() {
		$gateService = new MigoAutomationModel();
		$json = $this->request->getJSON();
		$result = $gateService->getMiroDetailsByIdWheat($json);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function MiroDetailReportWheat($fromDate, $toDate, $moduleTypeId, $userInfoId,$status,$plantCode=null,$Userplant=null)
	{
		$gateService = new MigoAutomationModel();
		$results = $gateService->MiroDetailReportWheat($fromDate, $toDate, $moduleTypeId, $userInfoId,$status,$plantCode,$Userplant);
		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
	public function getMiroDetailsTruckPurchase($fromDate, $toDate, $userId) {
		$gateService = new MigoAutomationModel();
		$result = $gateService->getMiroDetailsTruckPurchase($fromDate, $toDate, $userId);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function InvoiceDetailsChangeWheatPurchase($fromDate, $toDate)
	{
		$gateService = new MigoAutomationModel();
		$results = $gateService->InvoiceDetailsChangeWheatPurchase($fromDate, $toDate);

		$dataStatus = count($results) > 0 ? true : false;
		$message = count($results) > 0 ? 'data found' : 'No data found';

		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $results]);
	}
	public function UpdateInvoiceWheatPurchase() {
		try {
			// ------------------------
			// 1. Get POST Data
			// ------------------------
			$json = $this->request->getJSON();
			$gateInOutInfoId = $json->gateInOutInfoId;
			$invoiceCopy = $json->invoiceCopy;
			$invoiceDate = $json->invoiceDate;
			$invoiceNo = $json->invoiceNo;
			if (!$gateInOutInfoId || !$invoiceNo || !$invoiceDate || !$invoiceCopy) {
				return $this->response->setJSON([
				'success' => false,
				'message' => 'Missing required fields'
			]);
			}
			// ------------------------
			// 2. Prepare update data
			// ------------------------
			$updateData = [
				'ZSUPPLIER_INV_NO' => $invoiceNo,
				'ZSUPPLIER_INV_DT' => $invoiceDate,
				'INV_COPY' => $invoiceCopy,
			];

			// ------------------------
			// 3. Update DB
			// ------------------------
			$db = db_connect();
			$builder = $db->table('supplier_vehical_info'); // Replace table name if needed
			$builder->where('SUP_VE_REFID', $gateInOutInfoId);
			$updated = $builder->update($updateData);

			if ($updated) {
				$response = [
					'success' => true,
					'message' => 'Invoice updated successfully'
				];
			} else {
				return $this->response->setJSON([
				'success' => false,
				'message' => 'Failed to update invoice'
			]);
			}

			return $this->response->setJSON($response);

		} catch (\Exception $e) {
			return $this->response->setJSON([
				'success' => false,
				'message' => $e->getMessage()
			]);
		}
	}
	public function getMiroApprovalDetailsList($userId,$fromDate,$toDate,$status,$plantCode=null) {
		$gateService = new MigoAutomationModel();   
		$json = $this->request->getJSON(); 
		$result = $gateService->getMiroDetailsApprovalList($userId,$fromDate,$toDate,$status,$plantCode);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function getMiroDetailsByIdConditionsWheat() {
		$gateService = new MigoAutomationModel();
		$json = $this->request->getJSON();
		$result = $gateService->getMiroDetailsByIdConditionsWheat($json);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}
	public function getMiroDetailsByIdConditionsWheatRakeFCI() {
		$gateService = new MigoAutomationModel();
		$json = $this->request->getJSON();
		$result = $gateService->getMiroDetailsByIdConditionsWheatRakeFCI($json);
		$dataStatus = count($result) > 0 ? true : false;
		$message = count($result) > 0 ? 'data found' : 'No data found';
	
		return  $this->respond(["success" => $dataStatus, "message" => $message, "results" => $result]);
	}

	public function getCondtionDetails()
	{
		$json = $this->request->getJSON();
		$db = db_connect();

		// ✅ Validate input
		if (empty($json->poNumbers)) {
			return $this->respond([
				"success" => 0,
				"message" => "No PO numbers provided",
				"results" => [],
				"errors" => []
			]);
		}

		$finalResult = [];
		$errors = [];
		$success = true;

		// ✅ Step 1: Collect all SAP data first
		$allSapRows = [];

		$builder1 = $db->table('condition_details');
		$builder1->select('condition, userDepartment');
		$builder1->where('status', 1);
		$userDepartments = [];
		if (!empty($json->userDepartment)) {
			$userDepartments = is_array($json->userDepartment)
				? $json->userDepartment
				: [$json->userDepartment];
		}
		if (!empty($userDepartments)) {
			$builder1->whereIn('userDepartment', $userDepartments);
		}
        $dbResults1 = $builder1->get()->getResultArray();

		$selectedConditions = [];
		if (!empty($json->condtion) && is_array($json->condtion)) {
			$selectedConditions = array_map(fn($value) => mb_strtolower(trim((string) $value)), array_filter($json->condtion, fn($value) => $value !== ''));
		}

		$defaultConditions = array_map(
			fn($row) => mb_strtolower(trim((string) ($row['condition'] ?? ''))),
			$dbResults1
		);
		$defaultConditions = array_filter($defaultConditions);

		$allowedConditions = $selectedConditions;
		if (empty($allowedConditions)) {
			$allowedConditions = array_values(array_unique($defaultConditions));
		}

		foreach ($json->poNumbers as $poNumber) {

			if (empty($poNumber)) continue;

			$urlPath = "zzgp_api/zzgp_migo/GP_MIR7_BULK?sap-client=900&po=" . $poNumber;

			$sapResponse = SapUrlHelper::getWhDatas($urlPath);
			//print_r($sapResponse);exit; // Debug: Check raw SAP response
			$result = json_decode($sapResponse, true);
			// print_r($result);exit; // Debug: Check decoded SAP result
			if (!empty($result) && is_array($result)) {

						foreach ($result as $row) {
							$rowConditionText = mb_strtolower(trim((string) ($row['ITEM_TEXT'] ?? $row['itemText'] ?? $row['CONDITION_NAME'] ?? $row['DESCRIPTION'] ?? '')));
							if (!empty($allowedConditions) && !in_array($rowConditionText, $allowedConditions, true)) {
								continue;
							}
						$row['po_number'] = $poNumber;
						$allSapRows[] = $row;
					}

			} else {
				$success = false;
				$errors[] = [
					"po_number" => $poNumber,
					"error" => "Invalid response from SAP"
				];
			}
		}

		// ✅ If no SAP data
		if (empty($allSapRows)) {
			return $this->respond([
				"success" => false,
				"message" => "No data from SAP",
				"results" => [],
				"errors" => $errors
			]);
		}

		// ✅ Step 2: Prepare keys for bulk DB query
		$conditions = [];

		foreach ($allSapRows as $row) {
			if (!empty($row['PO_NUMBER']) && !empty($row['PO_ITEM']) && !empty($row['GL']) && !empty($row['CONDITION']) && !empty($row['VALUATION_TYPE'])) {

				$conditions[] = [
					'condition'   => $row['CONDITION'],
					'valuationType' => $row['VALUATION_TYPE'],
					'poNumber' => $row['PO_NUMBER'],
					'poItem'   => $row['PO_ITEM'],
					'gl'       => $row['GL'],
				];
			}
		}
		// print_r($conditions);exit;
		// ✅ Step 3: Fetch all existing quantities in one query
		$existingData = [];
		$existingData1 = [];
		if (!empty($conditions)) {

			$builder = $db->table('miro_entry');
			$builder->select('condition, valuationType,poNumber, poItem, gl, SUM(quantity) as quantity,SUM(amount) as amount');
			$builder->whereIn('status', [1,2,3,4,5,6]);

			// Build grouped WHERE
			$builder->groupStart();
			foreach ($conditions as $cond) {
				$builder->orGroupStart()
					->where('condition', $cond['condition'])
					->where('valuationType', $cond['valuationType'])
					->where('poNumber', $cond['poNumber'])
					->where('poItem', $cond['poItem'])
					->where('gl', $cond['gl'])
				->groupEnd();
			}
			$builder->groupEnd();

			$builder->groupBy(['condition', 'valuationType', 'poNumber', 'poItem', 'gl']);

			$dbResults = $builder->get()->getResultArray();
			// print_r($dbResults);exit;
			// ✅ Convert to lookup map
			foreach ($dbResults as $row) {
				$key = $row['condition'].'_'.$row['valuationType'].'_'.$row['poNumber'].'_'.$row['poItem'].'_'.$row['gl'];
				$existingData[$key] = $row['quantity'];
				$existingData1[$key] = $row['amount'];
			}
		}

		// ✅ Step 4: Calculate balance quantity
		foreach ($allSapRows as $row) {

			$key = ($row['CONDITION'] ?? '') . '_' .
				($row['VALUATION_TYPE'] ?? '') . '_' .
				($row['PO_NUMBER'] ?? '') . '_' .
				($row['PO_ITEM'] ?? '') . '_' .
				($row['GL'] ?? '');

			$existingQty = $existingData[$key] ?? 0;
			$existingAmount = $existingData1[$key] ?? 0;
			$sapQty = $row['QUANTITY'] ?? 0;
			$sapAmount = $row['ITEM_AMOUNT'] ?? 0;

			$balanceQty = $sapQty - $existingQty;
			$balanceAmount = $sapAmount - $existingAmount;
			$row['QUANTITY'] = $balanceQty > 0 ? round($balanceQty, 3) : 0;
			$row['ITEM_AMOUNT'] = $balanceAmount > 0 ? round($balanceAmount, 2) : 0.1;
			$rowConditionText = mb_strtolower(trim((string) ($row['ITEM_TEXT'] ?? $row['itemText'] ?? $row['CONDITION_NAME'] ?? $row['DESCRIPTION'] ?? '')));

			if (!empty($allowedConditions) && in_array($rowConditionText, $allowedConditions, true) && ($balanceQty > 0 || $balanceAmount > 0)) {
				$finalResult[] = $row;
			}
			// $finalResult[] = $row;
		}

		// ✅ Final response
		return $this->respond([
			"success" => $finalResult ? true : false,
			"message" => $finalResult 
				? "Data fetched successfully" 
				: "No Conditon Details",
			"results" => $finalResult,
			"errors" => $errors
		]);
	}
	public function MiroInsert()
	{
		$db = db_connect();
		$json = $this->request->getJSON(true); // get as array
		// print_r($json);exit;
		// ✅ Initialize variables
		$insertCount = 0;
		$updateCount = 0;
		$processedItems = 0;

		$userId = $json->userId	 ?? 0;
		$currentDate = date('Y-m-d');
		$ZSUPPLIER_INV_DT = $json['docDate'] ?? $currentDate;
		$ZSUPPLIER_INV_NO = $json['refDocNo'] ?? null;
		$piRefId = $json['piRefId'] ?? 0;

		$INV_COPY = $json['shipmentCopy'] ?? null;
		
		// print_r($json['poData']);exit;
		// ✅ Validate input
		if (empty($json['poData']) || !is_array($json['poData'])) {
			return $this->response->setJSON([
				"success" => false,
				"message" => "Invalid input data"
			]);
		}

		$db->transStart(); // ✅ Start transaction
		$gateService = new MigoAutomationModel();
		$data = $gateService->MiroLastID($json['poData'][0]['PLANT']);
		$transcation_unique_no = $data[0]['miroId'];
		$res = VANumberHelper::VANumberHelper('PT','MIRO', $transcation_unique_no);

		// $vendorCode = $json->selectedVendorValue ?? $json['poData'][0]['VENDOR'] ?? rand(100,999);
		$vendorCode = $json->selectedVendorValue 
			?? ($json['poData'][0]['VENDOR'] ?? null) 
			?? rand(100, 999);
		$currentDateTime = date('dmyHis');
		$uniqueCode = $currentDateTime . $vendorCode;
		foreach ($json['poData'] as $resultRow) {
			// print_r($resultRow);exit;
			$processedItems++;

			$VENDOR    = $json['selectedVendorValue'] ? $json['selectedVendorValue'] :  $resultRow['VENDOR']	;
			$VENDORNAME    = $json['selectedVendorLabel'] ? $json['selectedVendorLabel'] : $resultRow['VENDOR_NAME1']	;
			$PO_NUMBER = $resultRow['PO_NUMBER'] ?? null;
			$PO_ITEM   = $resultRow['PO_ITEM'] ?? null;
			$GL        = $resultRow['GL'] ?? null;
			$ITEM_AMOUNT = $resultRow['ITEM_AMOUNT'] ?? null;
			$CONDITION = $resultRow['CONDITION'] ?? null;
			// print_r($resultRow);exit;
			if (!$VENDOR || !$PO_NUMBER || !$PO_ITEM || !$GL) {
				// print_r('$exists');exit;
				continue;
			}

			// ✅ Check duplicate
			$exists = $db->table('miro_entry')
				->where([
					'vendor'   => $VENDOR,
					'poNumber' => $PO_NUMBER,
					'poItem'   => $PO_ITEM,
					'gl'       => $GL,
					'amount'   => $ITEM_AMOUNT,
					'condition' => $CONDITION
				])
				->whereIn('status', [1, 2, 3, 4, 5, 6])
				->countAllResults();
			// print_r($exists);exit;
					
			if ($exists == 0) {
				$insertData = [
					"lineItem" => $resultRow['BUZEI'] ?? 0,
					"miroId" => $uniqueCode ?? $res,
					"poNumber" => $PO_NUMBER,
					"poItem" => $PO_ITEM,
					"refNo" => 0,
					"refLine" => $resultRow['REF_LINE'] ?? 0,
					"migoNumber" => $resultRow['MIGO_NUMBER'] ?? 0,
					"migoLine" => $resultRow['MIGO_LINE'] ?? 0,
					"year" => $resultRow['YEAR'] ?? null,
					"condition" => $resultRow['CONDITION'] ?? null,
					"vendor" => $VENDOR ?? null,
					"taxCode" => $resultRow['TAX_CODE'] ?? null,
					"amount" => $resultRow['ITEM_AMOUNT'] ?? 0,
					"quantity" => $resultRow['QUANTITY'] ?? 0,
					"poUnit" => $resultRow['PO_UNIT'] ?? null,
					"itemText" => $resultRow['DESCRIPTION'] ?? '',
					"gl" => $GL,
					"valuationType" => $resultRow['VALUATION_TYPE'] ?? null,
					"docDate" => $ZSUPPLIER_INV_DT,
					"postingDate" => $currentDate,
					"refDocNo" => $ZSUPPLIER_INV_NO,
					"compCode" => $resultRow['COMP_CODE'] ?? null,
					"currency" => $resultRow['CURRENCY'] ?? null,
					"gross_amount" => $json['totalAmount'] ?? $resultRow['ITEM_AMOUNT'],
					"purchaseInfoId" => $piRefId,
					"plantCode" => $resultRow['PLANT'] ?? null,
					"paymentMethod" => $resultRow['PAYMENT_METHOD'] ?? null,
					"profitCenter" => $resultRow['PROFIT_CENTER'] ?? null,
					"costCenter" => $resultRow['COSTCENTER'] ?? null,
					"fiDocument" => $resultRow['FI_DOC'] ?? 0,
					"status" => $json['status'] ?? 5,
					"createdBy" => $userId,
					"vendorName" => $VENDORNAME ?? null,
					"totalTax" => $resultRow['TOTAL_TAX'] ?? 0,
					"conditionDetails" => $resultRow['CONDITION_INT'] ?? null,
					"orderQty" => $resultRow['ORDER_QTY'] ?? 0,
					"orderUnit" => $resultRow['ORDER_UNIT'] ?? null,
					"serviceLine" => $resultRow['SER_LINE'] ?? null,
					"invoiceCopy" => $INV_COPY,
					"vendorWBCopy" => '',
					"externalWbCopy" => '',
					"attach" => 0,
					"baseAmount"=> $resultRow['_baselineTotal'] ?? 0,
					"baseQty"=> $resultRow['_originalQuantity'] ?? 0,
					"existingVendor"=> $json['selectedVendorValue'] ? $resultRow['VENDOR'] : null,
					"conditionName"=> $resultRow['CONDITION_NAME'] ?? null,
				];
				// print_r($insertData);exit;
				$db->table('miro_entry')->insert($insertData);
				$insertCount++;
				// print_r($db->error());exit;
			}

		}
		// print_r('$json');exit;
		$db->transComplete(); // ✅ End transaction
		
		if ($db->transStatus() === false) {
			return $this->response->setJSON([
				"success" => false,
				"message" => "Database error occurred"
			]);
		}

		return $this->response->setJSON([
			"success" => true,
			"message" => "MIRO entries processed successfully",
			"inserted" => $insertCount,
			"updated" => $updateCount,
			"processed" => $processedItems
		]);
	}
	public function getSAPVendorDetails($vendorCode) {
		$gateService = new MigoAutomationModel(); 
		$urlPath = "zrecc_bank/Bankinfoupdate?sap-client=900&VENDOR_NO=$vendorCode";
		$data = SapUrlHelper::getWhDatas($urlPath);
		$result = json_decode($data, true);
		$dataStatus = is_array($result) && count($result) > 0;
		$message = $dataStatus ? 'Data found' : 'No data found';
		return $this->respond([
			"success" => $dataStatus,
			"message" => $message,
			"results" => $dataStatus ? $result : [],
		]);
	}
}
